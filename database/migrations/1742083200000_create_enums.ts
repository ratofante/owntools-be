import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE wallet_role AS ENUM ('owner', 'member');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `)
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE wallet_status AS ENUM ('pending', 'active', 'inactive');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `)
  }

  async down() {
    await this.db.rawQuery(`DROP TYPE IF EXISTS wallet_role`)
    await this.db.rawQuery(`DROP TYPE IF EXISTS wallet_status`)
  }
}
