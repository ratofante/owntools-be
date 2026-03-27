import { BaseModel, column } from '@adonisjs/lucid/orm'

export type WalletRole = 'owner' | 'member'
export type WalletStatus = 'pending' | 'active' | 'inactive'

export default class UserWallet extends BaseModel {
  static table = 'user_wallets'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare walletId: number

  @column()
  declare role: WalletRole

  @column()
  declare status: WalletStatus
}
