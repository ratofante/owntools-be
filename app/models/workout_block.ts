import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
export type BlockType = 'straight_set' | 'timed_set' | 'emom' | 'hiit'

export default class WorkoutBlock extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare blockType: BlockType

  @column()
  declare name: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
