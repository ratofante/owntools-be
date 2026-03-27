import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wallets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // ISO 4217 currency code, e.g. ARS, USD, EUR
      // Defaults to ARS — change per environment as needed
      table.string('currency', 3).notNullable().defaultTo('ARS')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('currency')
    })
  }
}
