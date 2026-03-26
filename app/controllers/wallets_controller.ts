import type { HttpContext } from '@adonisjs/core/http'
import { createWalletValidator } from '#validators/wallet'
import Wallet from '#models/wallet'

export default class WalletsController {
  async index({ response, auth }: HttpContext) {
    const wallets = await Wallet.query()
      .whereHas('users', (query) => {
        query.where('user_wallets.user_id', auth.user!.id)
      })
      .preload('users', (query) => {
        query.pivotColumns(['role', 'status'])
      })

    return response.status(200).json(
      wallets.map((wallet) => ({
        ...wallet.serialize(),
        users: wallet.users.map((user) => ({
          ...user.serialize(),
          role: user.$extras.pivot_role,
          status: user.$extras.pivot_status,
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
  /**
   * Creates a new shared wallet.
   *
   * @bodyParam {string} name - The wallet name.
   * @bodyParam {number[]} userIds - IDs of the users to invite as participants.
   */
  async create({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createWalletValidator)

    const wallet = await Wallet.create({
      name: payload.name,
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
}
