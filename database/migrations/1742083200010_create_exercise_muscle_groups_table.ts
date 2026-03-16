import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exercise_muscle_groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('exercise_id')
        .unsigned()
        .references('exercises.id')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('muscle_group_id')
        .unsigned()
        .references('muscle_groups.id')
        .onDelete('CASCADE')
        .notNullable()
      table.enum('involvement_level', ['primary', 'secondary']).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.unique(['exercise_id', 'muscle_group_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
