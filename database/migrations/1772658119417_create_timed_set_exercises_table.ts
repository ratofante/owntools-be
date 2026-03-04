import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'timed_set_exercises'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('timed_set_id').unsigned().references('timed_sets.id').notNullable()
      table.integer('set_exercise_id').unsigned().references('set_exercises.id')
      table.smallint('position').notNullable()
      table.unique(['timed_set_id', 'position'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
