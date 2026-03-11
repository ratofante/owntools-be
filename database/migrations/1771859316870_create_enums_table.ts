import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(
      `CREATE TYPE block_type AS ENUM ('straight_set', 'timed_set', 'emom', 'hiit')`
    )
    await this.db.rawQuery(`CREATE TYPE timed_set_type AS ENUM ('amrap', 'chipper')`)
  }

  async down() {
    await this.db.rawQuery(`DROP TYPE IF EXISTS block_type`)
    await this.db.rawQuery(`DROP TYPE IF EXISTS timed_set_type`)
    await this.db.rawQuery(`DROP TYPE IF EXISTS hiit_type`)
  }
}
