import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exercise_body_zones'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('exercise_id').unsigned().references('exercises.id')
      table.integer('body_zone_id').unsigned().references('body_zones.id')
      table.string('zone_importance').nullable()
      table.unique(['exercise_id', 'body_zone_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
