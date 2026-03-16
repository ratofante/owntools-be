import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Exercise from '#models/exercise'

export default class MuscleGroup extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Exercise, {
    pivotTable: 'exercise_muscle_groups',
    pivotForeignKey: 'muscle_group_id',
    pivotRelatedForeignKey: 'exercise_id',
    pivotColumns: ['involvement_level'],
  })
  declare exercises: ManyToMany<typeof Exercise>
}
