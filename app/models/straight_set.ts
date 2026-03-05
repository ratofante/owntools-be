import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import WorkoutBlock from '#models/workout_block'
import SetExercise from '#models/set_exercise'

export default class StraightSet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare workoutBlockId: number

  @column()
  declare setExerciseId: number

  @column()
  declare sets: number

  @column()
  declare rest: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => WorkoutBlock, {
    foreignKey: 'workoutBlockId',
    localKey: 'id',
  })
  declare workoutBlock: BelongsTo<typeof WorkoutBlock>

  @belongsTo(() => SetExercise, {
    foreignKey: 'setExerciseId',
    localKey: 'id',
  })
  declare setExercise: BelongsTo<typeof SetExercise>
}
