import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Routine from '#models/routine'
import WorkoutBlock from '#models/workout_block'

export default class RoutineWorkoutBlock extends BaseModel {
  static table = 'routine_workout_blocks'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare routineId: number

  @column()
  declare workoutBlockId: number

  @column()
  declare position: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Routine, {
    foreignKey: 'routineId',
  })
  declare routine: BelongsTo<typeof Routine>

  @belongsTo(() => WorkoutBlock, {
    foreignKey: 'workoutBlockId',
  })
  declare workoutBlock: BelongsTo<typeof WorkoutBlock>
}
