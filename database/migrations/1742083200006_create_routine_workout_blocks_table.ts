import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routine_workout_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('routine_id')
        .unsigned()
        .references('routines.id')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('workout_block_id')
        .unsigned()
        .references('workout_blocks.id')
        .onDelete('RESTRICT')
        .notNullable()
      table.smallint('position').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.unique(['routine_id', 'position'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
