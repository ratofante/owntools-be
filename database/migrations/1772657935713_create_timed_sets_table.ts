import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'timed_sets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('workout_block_id').unsigned().references('workout_blocks.id').notNullable()
      table.unique(['workout_block_id'])
      table.specificType('type', 'timed_set_type').notNullable()
      table.smallint('time').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
