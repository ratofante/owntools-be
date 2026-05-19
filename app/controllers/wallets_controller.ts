import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { createWalletValidator } from '#validators/wallet'
import Wallet from '#models/wallet'
import Category from '#models/category'
export default class WalletsController {
  async index({ request, response, auth }: HttpContext) {
    const { from, to } = request.qs()
    const dateFrom = from ?? DateTime.now().startOf('month').toISODate()
    const dateTo = to ?? DateTime.now().endOf('month').toISODate()

    const wallets = await Wallet.query()
      .whereHas('users', (query) => {
        query.where('user_wallets.user_id', auth.user!.id)
        query.where('user_wallets.status', 'active')
      })
      .where('wallet_type', 'shared')
      .withCount('expenses')
      .preload('users', (query) => {
        query.pivotColumns(['role', 'status'])
      })
      .preload('expenses', (query) => {
        query.orderBy('date', 'desc')
        query.orderBy('created_at', 'desc')
        query.limit(5)
        query.preload('categoryExpenses', (q) =>
          q.where('user_id', auth.user!.id).preload('category')
        )
      })

    const walletIds = wallets.map((w) => w.id)
    const monthCounts =
      walletIds.length > 0
        ? await db
            .from('expenses')
            .whereIn('wallet_id', walletIds)
            .where('date', '>=', dateFrom)
            .where('date', '<=', dateTo)
            .groupBy('wallet_id')
            .select('wallet_id')
            .count('* as count')
            .sum('amount_cents as total_cents')
        : []

    const monthCountMap = new Map(monthCounts.map((r) => [r.wallet_id, Number(r.count)]))
    const monthTotalMap = new Map(monthCounts.map((r) => [r.wallet_id, Number(r.total_cents)]))

    return response.status(200).json(
      wallets.map((wallet) => ({
        ...wallet.serialize(),
        expensesCount: Number(wallet.$extras.expenses_count),
        thisMonthExpensesCount: monthCountMap.get(wallet.id) ?? 0,
        thisMonthExpensesTotalCents: monthTotalMap.get(wallet.id) ?? 0,
        users: wallet.users.map((user) => ({
          ...user.serialize(),
          role: user.$extras.pivot_role,
          status: user.$extras.pivot_status,
        })),
        expenses: wallet.expenses.map((expense) => ({
          ...expense.serialize(),
          category: expense.categoryExpenses[0]?.category ?? null,
        })),
      }))
    )
  }

  async find({ params, request, auth, response }: HttpContext) {
    const { from, to } = request.qs()
    const dateFrom = from ?? DateTime.now().startOf('month').toISODate()
    const dateTo = to ?? DateTime.now().endOf('month').toISODate()

    const wallet = await Wallet.query()
      .where('id', params.id)
      .whereHas('users', (query) => {
        query.where('user_wallets.user_id', auth.user!.id)
      })
      .withCount('expenses')
      .preload('users', (query) => {
        query.pivotColumns(['role', 'status'])
      })
      .preload('expenses', (query) => {
        query.orderBy('date', 'desc')
        query.orderBy('created_at', 'desc')
        query.where('date', '>=', dateFrom)
        query.where('date', '<=', dateTo)
        query.preload('categoryExpenses', (q) =>
          q.where('user_id', auth.user!.id).preload('category')
        )
      })
      .first()

    if (!wallet) {
      return response.status(403).json({ message: 'Access denied' })
    }

    const [monthStats] = await db
      .from('expenses')
      .where('wallet_id', wallet.id)
      .where('date', '>=', dateFrom)
      .where('date', '<=', dateTo)
      .count('* as count')
      .sum('amount_cents as total_cents')

    return response.status(200).json({
      ...wallet.serialize(),
      expensesCount: Number(wallet.$extras.expenses_count),
      thisMonthExpensesCount: Number(monthStats.count),
      thisMonthExpensesTotalCents: Number(monthStats.total_cents ?? 0),
      users: wallet.users.map((user) => ({
        ...user.serialize(),
        role: user.$extras.pivot_role,
        status: user.$extras.pivot_status,
      })),
      expenses: wallet.expenses.map((expense) => ({
        ...expense.serialize(),
        category: expense.categoryExpenses[0]?.category ?? null,
      })),
    })
  }

  async create({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createWalletValidator)

    const wallet = await Wallet.create({
      name: payload.name,
      walletType: payload.wallet_type,
    })

    const memberPivotData = Object.fromEntries(
      payload.userIds.map((id) => [id, { role: 'member', status: 'pending' }])
    )

    await wallet.related('users').attach({
      ...memberPivotData,
      [auth.user!.id]: { role: 'owner', status: 'active' },
    })

    return response.status(201).json(wallet)
  }

  async personalExpenses({ request, response, auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const { from, to } = request.qs()

    if (!from || !to) {
      return response.status(422).json({ message: 'from and to query params are required' })
    }

    const wallet = await Wallet.query()
      .preload('expenses', (expenseQuery) => {
        expenseQuery
          .orderBy('date', 'desc')
          .orderBy('created_at', 'desc')
          .preload('categoryExpenses', (q) => q.where('user_id', userId).preload('category'))
          .where('date', '>=', from)
          .where('date', '<=', to)
      })
      .whereHas('users', (query) => {
        query.where('user_wallets.user_id', userId)
      })
      .where('wallet_type', 'personal')
      .where('name', 'Gastos Personales')
      .first()

    if (!wallet) {
      return response.status(404).json({ message: 'Wallet not found' })
    }

    return response.status(200).json({
      ...wallet.serialize(),
      expenses: wallet.expenses.map((expense) => ({
        ...expense.serialize(),
        category: expense.categoryExpenses[0]?.category ?? null,
      })),
    })
  }

  /**
   * GET /wallets/:id/balances
   * Returns how much each member is owed or owes within the wallet.
   * Positive balance → user is owed money. Negative → user owes money.
   */
  async categories({ response, auth }: HttpContext) {
    const categories = await Category.query().where('userId', auth.user!.id)
    return response.status(200).json({ categories })
  }

  async createCategory({ request, response, auth }: HttpContext) {
    const { name, description } = request.only(['name', 'description'])
    const category = await Category.create({
      name,
      description: description ?? null,
      userId: auth.user!.id,
    })
    return response.status(201).json({ category })
  }

  async balances({ params, response }: HttpContext) {
    const rows = await db
      .from('expense_shares')
      .join('expenses', 'expense_shares.expense_id', 'expenses.id')
      .where('expenses.wallet_id', params.walletId)
      .groupBy('expense_shares.user_id')
      .select('expense_shares.user_id')
      .sum('expense_shares.paid_amount_cents as total_paid')
      .sum('expense_shares.share_amount_cents as total_owed')

    const balances = rows.map((row) => ({
      userId: row.user_id,
      balanceCents: Number(row.total_paid) - Number(row.total_owed),
    }))

    return response.ok(balances)
  }
}
