import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Expense from '#models/expense'
import User from '#models/user'

export type ShareStatus = 'pending' | 'settled'

export default class ExpenseShare extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare expenseId: number

  @column()
  declare userId: number

  @column()
  declare shareAmountCents: number

  @column()
  declare paidAmountCents: number

  @column()
  declare status: ShareStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Expense)
  declare expense: BelongsTo<typeof Expense>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
