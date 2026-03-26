import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_wallets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table
        .integer('wallet_id')
        .unsigned()
        .references('wallets.id')
        .onDelete('CASCADE')
        .notNullable()
      table.specificType('role', 'wallet_role').notNullable().defaultTo('member')
      table.specificType('status', 'wallet_status').notNullable().defaultTo('pending')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
