import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import BodyZone from '#models/body_zone'
import MuscleGroup from '#models/muscle_group'

export default class Exercise extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare createdBy: number | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare videoUrl: string | null

  @column()
  declare bodyZoneId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
    localKey: 'id',
  })
  declare user: BelongsTo<typeof User>

  @manyToMany(() => BodyZone, {
    pivotTable: 'exercise_body_zones',
    pivotForeignKey: 'exercise_id',
    pivotRelatedForeignKey: 'body_zone_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotColumns: ['zone_importance'],
  })
  declare bodyZones: ManyToMany<typeof BodyZone>

  @manyToMany(() => MuscleGroup, {
    pivotTable: 'exercise_muscle_groups',
    pivotForeignKey: 'exercise_id',
    pivotRelatedForeignKey: 'muscle_group_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotColumns: ['involvement_level'],
  })
  declare muscleGroups: ManyToMany<typeof MuscleGroup>
}
