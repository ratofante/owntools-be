import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Expense from '#models/expense'
import ExpenseShare from '#models/expense_share'
import UserWallet from '#models/user_wallet'
import Category from '#models/category'
import { splitEqually, validateCustomShares } from '#services/expense_splitter'
// Wallet membership is enforced upstream by WalletAccessMiddleware.
import { DateTime } from 'luxon'
import {
  createExpenseValidator,
  patchExpenseValidator,
  updateExpenseValidator,
} from '#validators/expense'
import { addPersonalExpenseValidator } from '#validators/personal_expense'

export default class ExpensesController {
  /**
   * GET /wallets/:walletId/expenses
   * Returns all expenses for the wallet, newest first, with shares preloaded.
   */
  async index({ params, response }: HttpContext) {
    const expenses = await Expense.query()
      .where('wallet_id', params.walletId)
      .preload('paidBy')
      .preload('category')
      .preload('shares', (q) => q.preload('user'))
      .orderBy('date', 'desc')
      .orderBy('created_at', 'desc')

    return response.ok(expenses)
  }

  /**
   * POST /wallets/:walletId/expenses
   * Creates an expense and its shares in a single transaction.
   */
  async store({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const data = await request.validateUsing(createExpenseValidator)

    if (data.is_shared && !data.split_type) {
      return response.badRequest({ message: 'split_type is required when is_shared is true' })
    }

    let memberIds: number[] = []
    if (data.is_shared) {
      const activeMembers = await UserWallet.query()
        .where('wallet_id', params.walletId)
        .where('status', 'active')
        .select('user_id')
      memberIds = activeMembers.map((m) => m.userId)
    }

    const expense = await db.transaction(async (trx) => {
      const newExpense = await Expense.create(
        {
          walletId: Number(params.walletId),
          paidByUserId: user.id,
          description: data.description,
          amountCents: data.amount_cents,
          isShared: data.is_shared,
          splitType: data.is_shared ? data.split_type : null,
          date: data.date ? DateTime.fromISO(data.date) : DateTime.now(),
        },
        { client: trx }
      )

      if (data.is_shared) {
        let shares: { userId: number; shareAmountCents: number; paidAmountCents: number }[]

        if (data.split_type === 'equal') {
          const amounts = splitEqually(data.amount_cents, memberIds.length)
          shares = memberIds.map((userId, i) => ({
            userId,
            shareAmountCents: amounts[i],
            paidAmountCents: userId === user.id ? data.amount_cents : 0,
          }))
        } else {
          if (!data.custom_shares || data.custom_shares.length === 0) {
            throw new Error('custom_shares is required when split_type is custom')
          }
          validateCustomShares(
            data.amount_cents,
            data.custom_shares.map((s) => s.share_amount_cents)
          )
          shares = data.custom_shares.map((s) => ({
            userId: s.user_id,
            shareAmountCents: s.share_amount_cents,
            paidAmountCents: s.user_id === user.id ? data.amount_cents : 0,
          }))
        }

        await ExpenseShare.createMany(
          shares.map((s) => ({ ...s, expenseId: newExpense.id })),
          { client: trx }
        )
      }

      return newExpense
    })

    await expense.load('shares', (q) => q.preload('user'))
    await expense.load('paidBy')

    return response.created(expense)
  }

  async addPersonalExpense({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(addPersonalExpenseValidator)

    const expense = await Expense.create({
      walletId: Number(params.walletId),
      paidByUserId: user.id,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      amountCents: data.amount_cents,
      date: data.date ? DateTime.fromISO(data.date) : DateTime.now(),
    })

    return response.created(expense)
  }

  /**
   * PUT /wallets/:walletId/expenses/:id
   * Updates description, amount, or date.
   * If amount_cents changes on an equal split, shares are recalculated automatically.
   * To change split_type or reassign custom shares, delete and recreate the expense.
   */
  // ------ OLD ROUTE -----------------------------------------------
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const expense = await Expense.query()
      .where('id', params.id)
      .where('wallet_id', params.walletId)
      .firstOrFail()

    if (expense.paidByUserId !== user.id) {
      return response.forbidden({ message: 'Only the payer can edit this expense' })
    }

    const data = await request.validateUsing(updateExpenseValidator)

    await db.transaction(async (trx) => {
      expense.useTransaction(trx)

      if (data.description) expense.description = data.description
      if (data.date) expense.date = DateTime.fromISO(data.date)

      if (data.amount_cents !== undefined && data.amount_cents !== expense.amountCents) {
        expense.amountCents = data.amount_cents

        if (expense.isShared && expense.splitType === 'equal') {
          const currentShares = await ExpenseShare.query({ client: trx }).where(
            'expense_id',
            expense.id
          )

          const amounts = splitEqually(data.amount_cents, currentShares.length)

          for (const [i, share] of currentShares.entries()) {
            share.shareAmountCents = amounts[i]
            if (share.userId === user.id) {
              share.paidAmountCents = data.amount_cents
            }
            await share.save()
          }
        }
      }

      await expense.save()
    })

    await expense.load('shares', (q) => q.preload('user'))
    return response.ok(expense)
  }

  /**
   * PATCH /wallets/:walletId/expenses/:id
   * Partial update: at least one of description, amount_cents, date, name, categoryId.
   * Only users with an active **owner** role on the wallet may perform this update.
   */
  async partialUpdate({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const walletId = Number(params.walletId)

    console.log('amountCents: ', request.body().amount_cents)

    const ownerMembership = await UserWallet.query()
      .where('wallet_id', walletId)
      .where('user_id', user.id)
      .where('role', 'owner')
      .where('status', 'active')
      .first()

    if (!ownerMembership) {
      return response.forbidden({
        message: 'Only an active wallet owner can update expenses with this route',
      })
    }

    const expense = await Expense.query()
      .where('id', params.id)
      .where('wallet_id', walletId)
      .first()

    if (!expense) {
      return response.notFound({ message: 'Expense not found' })
    }

    const data = await request.validateUsing(patchExpenseValidator)

    if (data.categoryId !== undefined && data.categoryId !== null) {
      const category = await Category.query()
        .where('id', data.categoryId)
        .where('userId', user.id)
        .first()

      if (!category) {
        return response.unprocessableEntity({
          message: 'Category does not belong to this user',
        })
      }
    }

    await db.transaction(async (trx) => {
      expense.useTransaction(trx)

      if (data.description !== undefined) {
        expense.description = data.description
      }

      if (data.date !== undefined) {
        expense.date = DateTime.fromISO(data.date)
      }

      if (data.name !== undefined) {
        expense.name = data.name
      }

      if (data.categoryId !== undefined) {
        expense.categoryId = data.categoryId
      }

      if (data.amount_cents !== undefined && data.amount_cents !== expense.amountCents) {
        expense.amountCents = data.amount_cents

        if (expense.isShared && expense.splitType === 'equal') {
          const currentShares = await ExpenseShare.query({ client: trx }).where(
            'expense_id',
            expense.id
          )

          const amounts = splitEqually(data.amount_cents, currentShares.length)

          for (const [i, share] of currentShares.entries()) {
            share.shareAmountCents = amounts[i]!
            if (share.userId === expense.paidByUserId) {
              share.paidAmountCents = data.amount_cents
            }
            await share.save()
          }
        }
      }

      await expense.save()
    })

    await expense.load('category')
    await expense.load('paidBy')
    await expense.load('shares', (q) => q.preload('user'))

    return response.ok(expense)
  }

  /**
   * DELETE /wallets/:walletId/expenses/:id
   * Deletes the expense. Shares are removed automatically via CASCADE.
   */
  async destroy({ params, response }: HttpContext) {
    const expense = await Expense.query()
      .where('id', params.id)
      .where('wallet_id', params.walletId)
      .firstOrFail()

    await expense.delete()

    return response.status(200).json({ message: 'Expense deleted successfully', data: expense })
  }
}
