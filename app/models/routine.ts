import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import WorkoutBlock from '#models/workout_block'

export default class Routine extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
    localKey: 'id',
  })
  declare user: BelongsTo<typeof User>

  @manyToMany(() => WorkoutBlock, {
    pivotTable: 'routine_blocks',
    pivotForeignKey: 'routine_id',
    pivotRelatedForeignKey: 'workout_block_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotColumns: ['position'],
  })
  declare workoutBlocks: ManyToMany<typeof WorkoutBlock>
}
