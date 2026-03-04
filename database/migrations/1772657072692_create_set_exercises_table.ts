import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'set_exercises'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('exercise_id').unsigned().references('exercises.id').notNullable()
      table.smallint('repetitions').nullable()
      table.decimal('percentage', 5, 4).nullable()
      table.decimal('target_weight', 6, 2).nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
