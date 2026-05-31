import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(
      `ALTER TYPE wallet_status ADD VALUE IF NOT EXISTS 'rejected'`
    )
  }

  async down() {
    // PostgreSQL does not support removing enum values without recreating the type.
  }
}
