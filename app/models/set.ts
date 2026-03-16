import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Exercise from '#models/exercise'

export type WeightUnit = 'kg' | 'lbs' | 'cal'

export default class Set extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare exerciseId: number | null

  @column()
  declare description: string | null

  @column()
  declare series: number

  @column()
  declare repetitions: number | null

  @column()
  declare timePerSeries: number | null

  @column()
  declare rest: number | null

  @column()
  declare percentage: number | null

  @column()
  declare targetRpe: number | null

  @column()
  declare targetWeightUnit: WeightUnit | null

  @column()
  declare targetWeightUnisexMax: number | null

  @column()
  declare targetWeightUnisexMin: number | null

  @column()
  declare targetWeightManMax: number | null

  @column()
  declare targetWeightManMin: number | null

  @column()
  declare targetWeightWomanMax: number | null

  @column()
  declare targetWeightWomanMin: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Exercise, {
    foreignKey: 'exerciseId',
  })
  declare exercise: BelongsTo<typeof Exercise>
}
