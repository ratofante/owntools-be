import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exercise_body_zones'

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
        .integer('body_zone_id')
        .unsigned()
        .references('body_zones.id')
        .onDelete('CASCADE')
        .notNullable()
      table.enum('zone_importance', ['primary', 'secondary']).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.unique(['exercise_id', 'body_zone_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
