import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import WorkoutBlock from '#models/workout_block'

export default class Routine extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => WorkoutBlock, {
    pivotTable: 'routine_workout_blocks',
    pivotForeignKey: 'routine_id',
    pivotRelatedForeignKey: 'workout_block_id',
    pivotColumns: ['position'],
  })
  declare workoutBlocks: ManyToMany<typeof WorkoutBlock>
}
