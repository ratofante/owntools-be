import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'categories'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'])
      table.dropColumn('user_id')
      table
        .integer('wallet_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('wallets')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['wallet_id'])
      table.dropColumn('wallet_id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
    })
  }
}
