import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Expense from '#models/expense'
import CategoryService from '#services/category_service'
import WalletMemberService from '#services/wallet_member_service'
import ExpenseShareService from '#services/expense_share_service'
import { DateTime } from 'luxon'
import {
  createExpenseValidator,
  patchExpenseValidator,
  putSharedExpenseValidator,
} from '#validators/expense'

@inject()
export default class ExpensesController {
  constructor(
    private categoryService: CategoryService,
    private walletMemberService: WalletMemberService,
    private expenseShareService: ExpenseShareService
  ) {}

  /**
   * GET /wallets/:walletId/expenses
   * Returns all expenses for the wallet, newest first, with shares preloaded.
   * Category is filtered to the current user's assignment.
   */
  async index({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const expenses = await Expense.query()
      .where('wallet_id', params.walletId)
      .preload('paidBy')
      .preload('categoryExpenses', (q) => q.where('user_id', user.id).preload('category'))
      .preload('shares', (q) => q.preload('user'))
      .orderBy('created_at', 'desc')

    return response.ok(expenses.map((e) => this.serializeExpense(e)))
  }

  /**
   * POST /wallets/:walletId/expenses
   * Creates a personal or shared expense in a single transaction.
   */
  async store({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const walletId = Number(params.walletId)

    const data = await request.validateUsing(createExpenseValidator)

    if (
      !data.is_shared &&
      (data.split_type || (data.custom_shares && data.custom_shares.length > 0))
    ) {
      return response.unprocessableEntity({
        message: 'split fields not allowed on personal expenses',
      })
    }

    if (data.is_shared && !data.split_type) {
      return response.badRequest({ message: 'split_type is required when is_shared is true' })
    }

    const categoryError = await this.categoryService.validateOwnership(user.id, data.categoryId)
    if (categoryError) {
      return response.unprocessableEntity({ message: categoryError })
    }

    let memberIds: number[] = []
    if (data.is_shared) {
      memberIds = await this.walletMemberService.getActiveMemberIds(walletId)
    }

    const expense = await db.transaction(async (trx) => {
      const newExpense = await Expense.create(
        {
          walletId,
          paidByUserId: user.id,
          name: data.name,
          description: data.description ?? null,
          amountCents: data.amount_cents,
          isShared: data.is_shared,
          splitType: data.is_shared ? data.split_type! : null,
          date: data.date ? DateTime.fromISO(data.date) : DateTime.now(),
        },
        { client: trx }
      )

      await this.categoryService.applyChange(trx, newExpense.id, user.id, data.categoryId)

      if (data.is_shared) {
        await this.expenseShareService.createShares(
          trx,
          newExpense.id,
          user.id,
          data.amount_cents,
          data.split_type!,
          memberIds,
          data.custom_shares
        )
      }

      return newExpense
    })

    await expense.load('categoryExpenses', (q) => q.where('user_id', user.id).preload('category'))
    await expense.load('shares', (q) => q.preload('user'))
    await expense.load('paidBy')

    return response.created(this.serializeExpense(expense))
  }

  /**
   * PATCH /wallets/:walletId/expenses/:id
   * Partial update for personal expenses only.
   */
  async patchPersonal({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const walletId = Number(params.walletId)

    const expense = await Expense.query()
      .where('id', params.id)
      .where('wallet_id', walletId)
      .first()

    if (!expense) {
      return response.notFound({ message: 'Expense not found' })
    }

    if (expense.isShared) {
      return response.unprocessableEntity({ message: 'Use PUT to update shared expenses' })
    }

    if (expense.paidByUserId !== user.id) {
      return response.forbidden({ message: 'Only the payer can edit this expense' })
    }

    const data = await request.validateUsing(patchExpenseValidator)

    const categoryError = await this.categoryService.validateOwnership(user.id, data.categoryId)
    if (categoryError) {
      return response.unprocessableEntity({ message: categoryError })
    }

    await db.transaction(async (trx) => {
      expense.useTransaction(trx)

      if (data.description !== undefined) {
        expense.description = data.description || null
      }

      if (data.date !== undefined) {
        expense.date = DateTime.fromISO(data.date)
      }

      if (data.name !== undefined) {
        expense.name = data.name
      }

      if (data.amount_cents !== undefined) {
        expense.amountCents = data.amount_cents
      }

      await this.categoryService.applyChange(trx, expense.id, user.id, data.categoryId)
      await expense.save()
    })

    await expense.load('categoryExpenses', (q) => q.where('user_id', user.id).preload('category'))
    await expense.load('paidBy')
    await expense.load('shares', (q) => q.preload('user'))

    return response.ok(this.serializeExpense(expense))
  }

  /**
   * PUT /wallets/:walletId/expenses/:id
   * Full replacement update for shared expenses.
   */
  async updateShared({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const walletId = Number(params.walletId)

    const expense = await Expense.query()
      .where('id', params.id)
      .where('wallet_id', walletId)
      .preload('shares')
      .preload('categoryExpenses', (q) => q.where('user_id', user.id))
      .first()

    if (!expense) {
      return response.notFound({ message: 'Expense not found' })
    }

    if (!expense.isShared) {
      return response.unprocessableEntity({ message: 'Use PATCH to update personal expenses' })
    }

    if (expense.paidByUserId !== user.id) {
      return response.forbidden({ message: 'Only the payer can edit this expense' })
    }

    const data = await request.validateUsing(putSharedExpenseValidator)

    if (data.split_type === 'custom') {
      if (!data.custom_shares || data.custom_shares.length === 0) {
        return response.unprocessableEntity({
          message: 'custom_shares is required when split_type is custom',
        })
      }

      try {
        this.expenseShareService.validateCustomShares(
          data.amount_cents,
          data.custom_shares.map((s) => s.share_amount_cents)
        )
      } catch (error) {
        return response.unprocessableEntity({
          message: error instanceof Error ? error.message : 'Invalid custom shares',
        })
      }

      const memberIds = await this.walletMemberService.getActiveMemberIds(walletId)
      const memberSet = new Set(memberIds)
      const invalidMember = data.custom_shares.find((s) => !memberSet.has(s.user_id))
      if (invalidMember) {
        return response.unprocessableEntity({
          message: 'custom_shares contains a user who is not an active wallet member',
        })
      }
    }

    const categoryError = await this.categoryService.validateOwnership(user.id, data.categoryId)
    if (categoryError) {
      return response.unprocessableEntity({ message: categoryError })
    }

    const currentShares = [...expense.shares]
    const shouldUpdateShares = this.expenseShareService.sharesNeedUpdate(
      expense.splitType,
      expense.amountCents,
      currentShares,
      data
    )

    await db.transaction(async (trx) => {
      expense.useTransaction(trx)

      await this.categoryService.applyChange(trx, expense.id, user.id, data.categoryId)

      expense.name = data.name
      expense.description = data.description ?? null
      expense.amountCents = data.amount_cents
      expense.date = DateTime.fromISO(data.date)
      expense.splitType = data.split_type
      await expense.save()

      if (shouldUpdateShares) {
        const memberIds = await this.walletMemberService.getActiveMemberIds(walletId)

        if (data.split_type === 'equal') {
          await this.expenseShareService.replaceEqualShares(
            trx,
            expense,
            data.amount_cents,
            memberIds,
            currentShares
          )
        } else {
          await this.expenseShareService.replaceCustomShares(
            trx,
            expense,
            data.amount_cents,
            data.custom_shares!,
            currentShares
          )
        }
      }
    })

    await expense.load('categoryExpenses', (q) => q.where('user_id', user.id).preload('category'))
    await expense.load('paidBy')
    await expense.load('shares', (q) => q.preload('user'))

    return response.ok(this.serializeExpense(expense))
  }

  /**
   * DELETE /wallets/:walletId/expenses/:id
   * Deletes the expense. Shares and category assignments are removed automatically via CASCADE.
   */
  async destroy({ params, response }: HttpContext) {
    const expense = await Expense.query()
      .where('id', params.id)
      .where('wallet_id', params.walletId)
      .firstOrFail()

    await expense.delete()

    return response.status(200).json({ message: 'Expense deleted successfully', data: expense })
  }

  private serializeExpense(expense: Expense) {
    return {
      ...expense.serialize(),
      category: expense.categoryExpenses?.[0]?.category ?? null,
    }
  }
}
