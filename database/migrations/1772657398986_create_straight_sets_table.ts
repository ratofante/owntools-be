import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'straight_sets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('workout_block_id').unsigned().references('workout_blocks.id').unique()
      table.integer('set_exercise_id').unsigned().references('set_exercises.id')
      table.smallint('sets').notNullable()
      table.smallint('rest')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
