import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Wallet from '#models/wallet'
import User from '#models/user'
import ExpenseShare from '#models/expense_share'
import Category from '#models/category'

export type SplitType = 'equal' | 'custom'

export default class Expense extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare walletId: number

  @column()
  declare paidByUserId: number

  @column()
  declare categoryId: number | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare amountCents: number

  @column()
  declare isShared: boolean

  @column()
  declare splitType: SplitType | null

  @column.date()
  declare date: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>

  @belongsTo(() => User, { foreignKey: 'paidByUserId' })
  declare paidBy: BelongsTo<typeof User>

  @hasMany(() => ExpenseShare)
  declare shares: HasMany<typeof ExpenseShare>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
