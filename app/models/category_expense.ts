import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'
import User from '#models/user'
import Expense from '#models/expense'

export default class CategoryExpense extends BaseModel {
  static table = 'category_expenses'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare expenseId: number

  @column()
  declare categoryId: number

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Expense)
  declare expense: BelongsTo<typeof Expense>
}
