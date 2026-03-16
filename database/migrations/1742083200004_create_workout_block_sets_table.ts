import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'workout_block_sets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('workout_block_id')
        .unsigned()
        .references('workout_blocks.id')
        .onDelete('CASCADE')
        .notNullable()
      table.integer('set_id').unsigned().references('sets.id').onDelete('RESTRICT').notNullable()
      table.smallint('position').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.unique(['workout_block_id', 'position'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
