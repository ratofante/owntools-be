import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Expense from '#models/expense'
import ExpenseShare from '#models/expense_share'
import UserWallet from '#models/user_wallet'
import { splitEqually, validateCustomShares } from '#services/expense_splitter'
import { DateTime } from 'luxon'
import { createExpenseValidator, updateExpenseValidator } from '#validators/expense'

export default class ExpensesController {
  /**
   * GET /wallets/:walletId/expenses
   * Returns all expenses for the wallet, newest first, with shares preloaded.
   */
  async index({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const membership = await UserWallet.query()
      .where('wallet_id', params.walletId)
      .where('user_id', user.id)
      .first()

    if (!membership) {
      return response.forbidden({ message: 'Not a member of this wallet' })
    }

    const expenses = await Expense.query()
      .where('wallet_id', params.walletId)
      .preload('paidBy')
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

    const membership = await UserWallet.query()
      .where('wallet_id', params.walletId)
      .where('user_id', user.id)
      .first()

    if (!membership) {
      return response.forbidden({ message: 'Not a member of this wallet' })
    }

    const data = await request.validateUsing(createExpenseValidator)

    const activeMembers = await UserWallet.query()
      .where('wallet_id', params.walletId)
      .where('status', 'active')
      .select('user_id')

    const memberIds = activeMembers.map((m) => m.userId)

    const expense = await db.transaction(async (trx) => {
      const newExpense = await Expense.create(
        {
          walletId: Number(params.walletId),
          paidByUserId: user.id,
          description: data.description,
          amountCents: data.amount_cents,
          splitType: data.split_type,
          date: data.date ? DateTime.fromISO(data.date) : DateTime.now(),
        },
        { client: trx }
      )

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

      return newExpense
    })

    await expense.load('shares', (q) => q.preload('user'))
    await expense.load('paidBy')

    return response.created(expense)
  }

  /**
   * PUT /wallets/:walletId/expenses/:id
   * Updates description, amount, or date.
   * If amount_cents changes on an equal split, shares are recalculated automatically.
   * To change split_type or reassign custom shares, delete and recreate the expense.
   */
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

        if (expense.splitType === 'equal') {
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
   * DELETE /wallets/:walletId/expenses/:id
   * Deletes the expense. Shares are removed automatically via CASCADE.
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const expense = await Expense.query()
      .where('id', params.id)
      .where('wallet_id', params.walletId)
      .firstOrFail()

    if (expense.paidByUserId !== user.id) {
      return response.forbidden({ message: 'Only the payer can delete this expense' })
    }

    await expense.delete()

    return response.noContent()
  }
}
