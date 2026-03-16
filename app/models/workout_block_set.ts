import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import WorkoutBlock from '#models/workout_block'
import Set from '#models/set'

export default class WorkoutBlockSet extends BaseModel {
  static table = 'workout_block_sets'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare workoutBlockId: number

  @column()
  declare setId: number

  @column()
  declare position: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => WorkoutBlock, {
    foreignKey: 'workoutBlockId',
  })
  declare workoutBlock: BelongsTo<typeof WorkoutBlock>

  @belongsTo(() => Set, {
    foreignKey: 'setId',
  })
  declare set: BelongsTo<typeof Set>
}
