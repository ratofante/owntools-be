import { BaseSchema } from '@adonisjs/lucid/schema'

// =============================================================================
// workout_blocks
// Supertype table for all workout block types.
// Every straight_set, timed_set, emom, and hiit_set registers here first.
// routine_blocks references this table to keep a single, clean join point.
// Coaches can optionally name a block (e.g. "Warmup", "Strength Block").
// =============================================================================

export default class extends BaseSchema {
  protected tableName = 'workout_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.specificType('block_type', 'block_type').notNullable()
      table.string('name').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
