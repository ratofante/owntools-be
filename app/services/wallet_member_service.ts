import { inject } from '@adonisjs/core'
import UserWallet from '#models/user_wallet'

@inject()
export default class WalletMemberService {
  async getActiveMemberIds(walletId: number): Promise<number[]> {
    const activeMembers = await UserWallet.query()
      .where('wallet_id', walletId)
      .where('status', 'active')
      .select('user_id')

    return activeMembers.map((m) => m.userId)
  }
}
