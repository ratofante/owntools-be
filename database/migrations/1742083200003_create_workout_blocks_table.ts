import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'workout_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.specificType('type', 'workout_block_type').notNullable()
      table.string('name', 255).nullable()
      table.text('description').nullable()

      // Round / rep structure
      table.smallint('rounds_per_workout').nullable()

      // Time (seconds)
      table.smallint('workout_duration').nullable()
      table.integer('time_to_complete').nullable()
      table.smallint('rest_after_round').nullable()
      table.smallint('rest_after_workout').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
