import { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Exercise from './exercise.js'

export default class BodyZone extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare hexColor: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Exercise, {
    pivotTable: 'exercise_body_zones',
    pivotForeignKey: 'body_zone_id',
    pivotRelatedForeignKey: 'exercise_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotColumns: ['zone_importance'],
  })
  declare exercises: ManyToMany<typeof Exercise>
}
