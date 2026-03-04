import { BaseSchema } from '@adonisjs/lucid/schema'

// =============================================================================
// set_exercises
// The atomic building block shared across all workout types.
// Holds exercise details: reps, percentage of 1RM, and target weight.
// All fields except exercise_id are optional to support time-based workouts
// where reps/weight may not apply.
// =============================================================================

export default class extends BaseSchema {
  protected tableName = 'workout_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('block_type', ['straight_set', 'timed_set', 'emom', 'hiit']).notNullable()
      table.string('name').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
