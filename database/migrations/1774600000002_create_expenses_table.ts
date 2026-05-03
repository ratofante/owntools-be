import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('wallet_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('wallets')
        .onDelete('CASCADE')

      table
        .integer('paid_by_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')

      table.string('name', 255).notNullable()
      table.string('description', 255)

      // Amount in cents (e.g. ARS 1500.00 → 150000)
      table.integer('amount_cents').unsigned().notNullable()

      table.boolean('is_shared').notNullable().defaultTo(false)

      // 'equal' | 'custom' — only relevant when is_shared is true
      table.enu('split_type', ['equal', 'custom']).nullable()

      // The date the expense occurred (not necessarily created_at)
      table.date('date').notNullable().defaultTo(this.db.rawQuery('now()').knexQuery)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
