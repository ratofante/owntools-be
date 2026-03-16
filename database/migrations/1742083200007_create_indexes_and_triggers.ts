import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Indexes
    await this.db.rawQuery(`CREATE INDEX idx_sets_exercise_id ON sets(exercise_id)`)
    await this.db.rawQuery(
      `CREATE INDEX idx_workout_block_sets_block_id ON workout_block_sets(workout_block_id)`
    )
    await this.db.rawQuery(
      `CREATE INDEX idx_workout_block_sets_set_id ON workout_block_sets(set_id)`
    )
    await this.db.rawQuery(
      `CREATE INDEX idx_routine_workout_blocks_routine_id ON routine_workout_blocks(routine_id)`
    )
    await this.db.rawQuery(
      `CREATE INDEX idx_routine_workout_blocks_block_id ON routine_workout_blocks(workout_block_id)`
    )

    // updated_at trigger function
    await this.db.rawQuery(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    // Attach triggers to each table
    const tables = [
      'sets',
      'workout_blocks',
      'workout_block_sets',
      'routines',
      'routine_workout_blocks',
    ]
    for (const table of tables) {
      await this.db.rawQuery(`
        CREATE TRIGGER trg_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION set_updated_at()
      `)
    }
  }

  async down() {
    const tables = [
      'sets',
      'workout_blocks',
      'workout_block_sets',
      'routines',
      'routine_workout_blocks',
    ]
    for (const table of tables) {
      await this.db.rawQuery(`DROP TRIGGER IF EXISTS trg_${table}_updated_at ON ${table}`)
    }

    await this.db.rawQuery(`DROP FUNCTION IF EXISTS set_updated_at`)

    await this.db.rawQuery(`DROP INDEX IF EXISTS idx_sets_exercise_id`)
    await this.db.rawQuery(`DROP INDEX IF EXISTS idx_workout_block_sets_block_id`)
    await this.db.rawQuery(`DROP INDEX IF EXISTS idx_workout_block_sets_set_id`)
    await this.db.rawQuery(`DROP INDEX IF EXISTS idx_routine_workout_blocks_routine_id`)
    await this.db.rawQuery(`DROP INDEX IF EXISTS idx_routine_workout_blocks_block_id`)
  }
}
