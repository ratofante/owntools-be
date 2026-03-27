import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expense_shares'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('expense_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('expenses')
        .onDelete('CASCADE')

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')

      // What this user owes for the expense
      table.integer('share_amount_cents').unsigned().notNullable()

      // What this user actually paid (full amount for the payer, 0 for everyone else)
      table.integer('paid_amount_cents').unsigned().notNullable().defaultTo(0)

      // 'pending' | 'settled'
      table.enu('status', ['pending', 'settled']).notNullable().defaultTo('pending')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // A user appears at most once per expense
      table.unique(['expense_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
