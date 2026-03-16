import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Set from '#models/set'

export type WorkoutBlockType = 'standard' | 'superset' | 'circuit' | 'amrap' | 'emom' | 'hiit'

export default class WorkoutBlock extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: WorkoutBlockType

  @column()
  declare name: string | null

  @column()
  declare description: string | null

  @column()
  declare roundsPerWorkout: number | null

  @column()
  declare workoutDuration: number | null

  @column()
  declare timeToComplete: number | null

  @column()
  declare restAfterRound: number | null

  @column()
  declare restAfterWorkout: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Set, {
    pivotTable: 'workout_block_sets',
    pivotForeignKey: 'workout_block_id',
    pivotRelatedForeignKey: 'set_id',
    pivotColumns: ['position'],
  })
  declare sets: ManyToMany<typeof Set>
}
