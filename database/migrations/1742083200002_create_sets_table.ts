import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('exercise_id')
        .unsigned()
        .references('exercises.id')
        .onDelete('SET NULL')
        .nullable()
      table.text('description').nullable()

      // Volume
      table.smallint('series').notNullable().defaultTo(1)
      table.smallint('repetitions').nullable()

      // Time (seconds)
      table.smallint('time_per_series').nullable()
      table.smallint('rest').nullable()

      // Intensity
      table.decimal('percentage', 5, 2).nullable()
      table.decimal('target_rpe', 3, 1).nullable()

      // Weight targets
      table.specificType('target_weight_unit', 'weight_unit').nullable()
      table.decimal('target_weight_unisex_max', 8, 2).nullable()
      table.decimal('target_weight_unisex_min', 8, 2).nullable()
      table.decimal('target_weight_man_max', 8, 2).nullable()
      table.decimal('target_weight_man_min', 8, 2).nullable()
      table.decimal('target_weight_woman_max', 8, 2).nullable()
      table.decimal('target_weight_woman_min', 8, 2).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
