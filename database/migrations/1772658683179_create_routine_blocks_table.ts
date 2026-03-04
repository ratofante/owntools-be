import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routine_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('routine_id').unsigned().references('routines.id').notNullable()
      table.integer('workout_block_id').unsigned().references('workout_blocks.id').notNullable()
      table.smallint('position').notNullable()
      table.unique(['routine_id', 'position'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
