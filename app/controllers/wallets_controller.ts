import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createWalletValidator } from '#validators/wallet'
import Wallet from '#models/wallet'
import Category from '#models/category'
export default class WalletsController {
  async index({ response, auth }: HttpContext) {
    const wallets = await Wallet.query()
      .whereHas('users', (query) => {
        query.where('user_wallets.user_id', auth.user!.id)
        query.where('user_wallets.status', 'active')
      })
      .where('wallet_type', 'shared')
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

    return response.status(200).json(
      wallets.map((wallet) => ({
        ...wallet.serialize(),
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

  async find({ params, auth, response }: HttpContext) {
    const wallet = await Wallet.query()
      .where('id', params.id)
      .whereHas('users', (query) => {
        query.where('user_wallets.user_id', auth.user!.id)
      })
      .preload('users', (query) => {
        query.pivotColumns(['role', 'status'])
      })
      .first()

    if (!wallet) {
      return response.status(403).json({ message: 'Access denied' })
    }

    return response.status(200).json({
      ...wallet.serialize(),
      users: wallet.users.map((user) => ({
        ...user.serialize(),
        role: user.$extras.pivot_role,
        status: user.$extras.pivot_status,
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
