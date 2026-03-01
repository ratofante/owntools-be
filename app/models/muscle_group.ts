import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Exercise from './exercise.js'

export default class MuscleGroup extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Exercise, {
    localKey: 'id',
    pivotTable: 'exercise_muscle_groups',
    relatedKey: 'id',
    pivotForeignKey: 'muscle_group_id',
    pivotRelatedForeignKey: 'exercise_id',
  })
  declare exercises: ManyToMany<typeof Exercise>
}
