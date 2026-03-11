import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import WorkoutBlock from '#models/workout_block'
import SetExercise from '#models/set_exercise'

export default class HiitSet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare workoutBlockId: number

  @column()
  declare rounds: number

  @column()
  declare work: number

  @column()
  declare rest: number

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
    pivotTable: 'hiit_set_exercises',
    pivotForeignKey: 'hiit_set_id',
    pivotRelatedForeignKey: 'set_exercise_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotColumns: ['position'],
  })
  declare setExercises: ManyToMany<typeof SetExercise>
}
