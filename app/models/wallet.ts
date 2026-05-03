import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Expense from '#models/expense'

export const SUPPORTED_CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'UYU'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

export const WALLET_TYPES = ['shared', 'personal'] as const
export type WalletType = (typeof WALLET_TYPES)[number]

export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare currency: Currency

  @column()
  declare walletType: WalletType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'user_wallets',
    pivotForeignKey: 'wallet_id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['role', 'status'],
  })
  declare users: ManyToMany<typeof User>

  @hasMany(() => Expense)
  declare expenses: HasMany<typeof Expense>

  /**
   * Format a cents value into a human-readable string for this wallet's currency.
   * e.g. formatAmount(150000) → "$ 1.500,00" (ARS locale)
   */
  formatAmount(cents: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: this.currency,
    }).format(cents / 100)
  }
}
