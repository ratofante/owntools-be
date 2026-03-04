import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'emom_intervals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('emom_id').unsigned().references('emoms.id')
      table.integer('set_exercise_id').unsigned().references('set_exercises.id')
      table.smallint('duration').notNullable().comment('seconds')
      table.smallint('position').notNullable()
      table.unique(['emom_id', 'position'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
