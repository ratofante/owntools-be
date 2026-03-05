import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import WorkoutBlock from '#models/workout_block'
import SetExercise from '#models/set_exercise'

export default class Emom extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare workoutBlockId: number

  @column()
  declare rounds: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => WorkoutBlock, {
    foreignKey: 'workoutBlockId',
    localKey: 'id',
  })
  declare workoutBlock: BelongsTo<typeof WorkoutBlock>

  @manyToMany(() => SetExercise, {
    pivotTable: 'emom_intervals',
    pivotForeignKey: 'emom_id',
    pivotRelatedForeignKey: 'set_exercise_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotColumns: ['position'],
  })
  declare setExercises: ManyToMany<typeof SetExercise>
}
