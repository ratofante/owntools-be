import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Set from '#models/set'
import BodyZone from '#models/body_zone'
import MuscleGroup from '#models/muscle_group'

export default class Exercise extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare videoUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Set, {
    foreignKey: 'exerciseId',
  })
  declare sets: HasMany<typeof Set>

  @manyToMany(() => MuscleGroup, {
    pivotTable: 'exercise_muscle_groups',
    pivotForeignKey: 'exercise_id',
    pivotRelatedForeignKey: 'muscle_group_id',
    pivotColumns: ['involvement_level'],
  })
  declare muscleGroups: ManyToMany<typeof MuscleGroup>

  @manyToMany(() => BodyZone, {
    pivotTable: 'exercise_body_zones',
    pivotForeignKey: 'exercise_id',
    pivotRelatedForeignKey: 'body_zone_id',
    pivotColumns: ['zone_importance'],
  })
  declare bodyZones: ManyToMany<typeof BodyZone>
}
