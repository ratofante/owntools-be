import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserWallet from '#models/user_wallet'

/**
 * Verifies the authenticated user is a member of the wallet identified
 * by the :walletId route parameter. Must run after the auth middleware.
 */
export default class WalletAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.getUserOrFail()

    const membership = await UserWallet.query()
      .where('wallet_id', ctx.params.walletId)
      .where('user_id', user!.id)
      .first()

    if (!membership || membership.status !== 'active') {
      return ctx.response.forbidden({ message: 'Not an active member of this wallet' })
    }

    return next()
  }
}
