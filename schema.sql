-- =============================================================================
-- MIGRATION: routines schema
-- All time fields are in seconds.
-- All weight fields are decimal(8,2) to support fractional weights (e.g. 102.5 kg)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE workout_block_type AS ENUM (
  'standard',
  'superset',
  'circuit',
  'amrap',
  'emom',
  'hiit'
);

CREATE TYPE weight_unit AS ENUM (
  'kg',
  'lbs',
  'cal'
);


-- -----------------------------------------------------------------------------
-- EXERCISES
-- Base table. Assumed to already exist in your DB — included here for
-- completeness and FK reference.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(255)  NOT NULL,
  description       TEXT,
  video_url         VARCHAR(500),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- SETS
-- A set is the atomic unit of work: one exercise, with its prescription.
-- series, repetitions, and time fields are the "what to do".
-- weight fields are the "how heavy".
-- Sets are reusable — they are linked to blocks via workout_block_sets.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sets (
  id                          SERIAL PRIMARY KEY,

  exercise_id                 INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
  description                 TEXT,

  -- Volume
  series                      SMALLINT      NOT NULL DEFAULT 1 CHECK (series >= 1),
  repetitions                 SMALLINT      CHECK (repetitions >= 0),

  -- Time (seconds)
  time_per_series             SMALLINT      CHECK (time_per_series > 0),  -- work window per series (hiit)
  rest                        SMALLINT      CHECK (rest >= 0),             -- rest after each series (standard/hiit)

  -- Intensity
  percentage                  DECIMAL(5,2)  CHECK (percentage > 0 AND percentage <= 100),
  target_rpe                  DECIMAL(3,1)  CHECK (target_rpe >= 1 AND target_rpe <= 10),

  -- Weight targets (decimals to support fractional plates e.g. 102.5 kg)
  target_weight_unit          weight_unit,
  target_weight_unisex_max    DECIMAL(8,2)  CHECK (target_weight_unisex_max > 0),
  target_weight_unisex_min    DECIMAL(8,2)  CHECK (target_weight_unisex_min > 0),
  target_weight_man_max       DECIMAL(8,2)  CHECK (target_weight_man_max > 0),
  target_weight_man_min       DECIMAL(8,2)  CHECK (target_weight_man_min > 0),
  target_weight_woman_max     DECIMAL(8,2)  CHECK (target_weight_woman_max > 0),
  target_weight_woman_min     DECIMAL(8,2)  CHECK (target_weight_woman_min > 0),

  created_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- min must never exceed max for any audience
  CONSTRAINT chk_weight_unisex  CHECK (target_weight_unisex_min  IS NULL OR target_weight_unisex_max  IS NULL OR target_weight_unisex_min  <= target_weight_unisex_max),
  CONSTRAINT chk_weight_man     CHECK (target_weight_man_min     IS NULL OR target_weight_man_max     IS NULL OR target_weight_man_min     <= target_weight_man_max),
  CONSTRAINT chk_weight_woman   CHECK (target_weight_woman_min   IS NULL OR target_weight_woman_max   IS NULL OR target_weight_woman_min   <= target_weight_woman_max)
);


-- -----------------------------------------------------------------------------
-- WORKOUT BLOCKS
-- A block is a named group of sets with a specific training modality.
-- The type field drives validation and UI rendering logic.
-- All time fields in seconds.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_blocks (
  id                    SERIAL PRIMARY KEY,

  type                  workout_block_type  NOT NULL,
  name                  VARCHAR(255),
  description           TEXT,

  -- Round / rep structure
  rounds_per_workout    SMALLINT      CHECK (rounds_per_workout > 0),

  -- Time (seconds)
  workout_duration      SMALLINT      CHECK (workout_duration > 0),   -- seconds per station/round (emom)
  time_to_complete      INTEGER       CHECK (time_to_complete > 0),   -- total block window (amrap)
  rest_after_round      SMALLINT      CHECK (rest_after_round >= 0),  -- rest between rounds
  rest_after_workout    SMALLINT      CHECK (rest_after_workout >= 0),-- rest after the full block

  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- WORKOUT BLOCK SETS
-- Junction table linking sets to blocks.
-- position defines execution order within the block.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_block_sets (
  id                SERIAL PRIMARY KEY,

  workout_block_id  INTEGER       NOT NULL REFERENCES workout_blocks(id) ON DELETE CASCADE,
  set_id            INTEGER       NOT NULL REFERENCES sets(id) ON DELETE RESTRICT,
  position          SMALLINT      NOT NULL CHECK (position >= 1),

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_block_set_position UNIQUE (workout_block_id, position)
);


-- -----------------------------------------------------------------------------
-- ROUTINES
-- A routine is an ordered collection of workout blocks.
-- created_by is a soft reference to your users table — adjust the FK to match
-- your actual users table name/column if needed.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routines (
  id            SERIAL PRIMARY KEY,

  name          VARCHAR(255)  NOT NULL,
  created_by    INTEGER,      -- FK to users table: REFERENCES users(id) ON DELETE SET NULL

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- ROUTINE WORKOUT BLOCKS
-- Junction table linking routines to workout blocks.
-- position defines the order of blocks within the routine.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routine_workout_blocks (
  id                SERIAL PRIMARY KEY,

  routine_id        INTEGER       NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  workout_block_id  INTEGER       NOT NULL REFERENCES workout_blocks(id) ON DELETE RESTRICT,
  position          SMALLINT      NOT NULL CHECK (position >= 1),

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_routine_block_position UNIQUE (routine_id, position)
);


-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------

-- sets: most common lookup is by exercise
CREATE INDEX idx_sets_exercise_id
  ON sets(exercise_id);

-- workout_block_sets: lookups by block (fetching all sets for a block)
CREATE INDEX idx_workout_block_sets_block_id
  ON workout_block_sets(workout_block_id);

-- workout_block_sets: lookups by set (finding which blocks use a set)
CREATE INDEX idx_workout_block_sets_set_id
  ON workout_block_sets(set_id);

-- routine_workout_blocks: lookups by routine (fetching all blocks for a routine)
CREATE INDEX idx_routine_workout_blocks_routine_id
  ON routine_workout_blocks(routine_id);

-- routine_workout_blocks: lookups by block (finding which routines use a block)
CREATE INDEX idx_routine_workout_blocks_block_id
  ON routine_workout_blocks(workout_block_id);


-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- Automatically updates the updated_at column on row modification.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sets_updated_at
  BEFORE UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workout_blocks_updated_at
  BEFORE UPDATE ON workout_blocks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workout_block_sets_updated_at
  BEFORE UPDATE ON workout_block_sets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_routine_workout_blocks_updated_at
  BEFORE UPDATE ON routine_workout_blocks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();