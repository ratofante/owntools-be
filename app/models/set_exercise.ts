import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Exercise from '#models/exercise'

export enum TargetWeightUnit {
  KG = 'kg',
  LBS = 'lbs',
  CAL = 'cal',
}

export default class SetExercise extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare exerciseId: number

  @column()
  declare repetitions: number | null

  @column()
  declare percentage: number | null

  @column()
  declare targetWeight: number | null

  @column()
  declare targetWeightUnit: TargetWeightUnit | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Exercise, {
    foreignKey: 'exerciseId',
    localKey: 'id',
  })
  declare exercise: BelongsTo<typeof Exercise>
}
