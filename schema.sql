-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE block_type AS ENUM ('straight_set', 'timed_set', 'emom', 'hiit');
CREATE TYPE timed_set_type AS ENUM ('amrap', 'chipper');
CREATE TYPE hiit_type AS ENUM ('hiit', 'tabata');


-- =============================================================================
-- body_zones
-- Represents broad anatomical regions of the body (e.g. "Upper Body", "Core").
-- Each zone has a hex color for UI display purposes.
-- =============================================================================
CREATE TABLE body_zones (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    hex_color   VARCHAR(255) NOT NULL,

    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);


-- =============================================================================
-- muscle_groups
-- Represents specific muscles or muscle groups (e.g. "Quadriceps", "Lats").
-- =============================================================================
CREATE TABLE muscle_groups (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,

    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);


-- =============================================================================
-- exercises
-- Master list of exercises (e.g. "Front Squat", "Burpee").
-- created_by is nullable to support globally seeded exercises.
-- =============================================================================
CREATE TABLE exercises (
    id          SERIAL PRIMARY KEY,
    created_by  INT REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    video_url   VARCHAR(255),

    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);


-- =============================================================================
-- exercise_muscle_groups
-- Join table linking exercises to the muscle groups they engage.
-- involvement_level indicates primary vs secondary engagement (optional).
-- =============================================================================
CREATE TABLE exercise_muscle_groups (
    id                  SERIAL PRIMARY KEY,
    exercise_id         INT REFERENCES exercises(id),
    muscle_group_id     INT REFERENCES muscle_groups(id),
    involvement_level   VARCHAR(255),
    UNIQUE (exercise_id, muscle_group_id),

    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);


-- =============================================================================
-- exercise_body_zones
-- Join table linking exercises to the body zones they target.
-- zone_importance indicates how central the zone is to the exercise (optional).
-- =============================================================================
CREATE TABLE exercise_body_zones (
    id              SERIAL PRIMARY KEY,
    exercise_id     INT REFERENCES exercises(id),
    body_zone_id    INT REFERENCES body_zones(id),
    zone_importance VARCHAR(255),
    UNIQUE (exercise_id, body_zone_id),

    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);


-- =============================================================================
-- set_exercises
-- The atomic building block shared across all workout types.
-- Holds exercise details: reps, percentage of 1RM, and target weight.
-- All fields except exercise_id are optional to support time-based workouts
-- where reps/weight may not apply.
-- =============================================================================
CREATE TABLE set_exercises (
    id              SERIAL PRIMARY KEY,
    exercise_id     INT NOT NULL REFERENCES exercises(id),
    repetitions     SMALLINT,
    percentage      NUMERIC(5,4),
    target_weight   NUMERIC(6,2)
);


-- =============================================================================
-- workout_blocks
-- Supertype table for all workout block types.
-- Every straight_set, timed_set, emom, and hiit_set registers here first.
-- routine_blocks references this table to keep a single, clean join point.
-- Coaches can optionally name a block (e.g. "Warmup", "Strength Block").
-- =============================================================================
CREATE TABLE workout_blocks (
    id          SERIAL PRIMARY KEY,
    block_type  block_type NOT NULL,
    name        VARCHAR(255)
);


-- =============================================================================
-- straight_sets
-- A classic set/rep scheme. Points to a single set_exercise and defines
-- how many sets and how long to rest between them (in seconds).
-- =============================================================================
CREATE TABLE straight_sets (
    id                  SERIAL PRIMARY KEY,
    workout_block_id    INT NOT NULL UNIQUE REFERENCES workout_blocks(id),
    set_exercise_id     INT NOT NULL REFERENCES set_exercises(id),
    sets                SMALLINT NOT NULL,
    rest                SMALLINT -- seconds
);


-- =============================================================================
-- timed_sets
-- A workout capped by a time limit. Supports two types:
--   amrap   - complete as many rounds/reps as possible within the time.
--   chipper - complete all exercises as fast as possible (time is a target).
-- =============================================================================
CREATE TABLE timed_sets (
    id                  SERIAL PRIMARY KEY,
    workout_block_id    INT NOT NULL UNIQUE REFERENCES workout_blocks(id),
    type                timed_set_type NOT NULL,
    time                SMALLINT NOT NULL -- seconds
);


-- =============================================================================
-- timed_set_exercises
-- Join table linking a timed_set to its exercises (ordered).
-- A NULL set_exercise_id represents a designated rest slot.
-- =============================================================================
CREATE TABLE timed_set_exercises (
    id              SERIAL PRIMARY KEY,
    timed_set_id    INT NOT NULL REFERENCES timed_sets(id),
    set_exercise_id INT REFERENCES set_exercises(id), -- NULL means rest
    position        SMALLINT NOT NULL
);


-- =============================================================================
-- emoms
-- Every Minute on the Minute workout. Each interval slot defines its own
-- duration to support E2MOM (120s), 90s cycles, or mixed intervals.
-- A NULL rounds means "as long as possible".
-- =============================================================================
CREATE TABLE emoms (
    id                  SERIAL PRIMARY KEY,
    workout_block_id    INT NOT NULL UNIQUE REFERENCES workout_blocks(id),
    rounds              SMALLINT -- NULL means "as long as possible"
);


-- =============================================================================
-- emom_intervals
-- Each row is one slot in the EMOM cycle (e.g. 1 min row, 1 min squats).
-- Duration defaults to 60s but can be any value to support E2MOM etc.
-- A NULL set_exercise_id represents a rest interval.
-- =============================================================================
CREATE TABLE emom_intervals (
    id              SERIAL PRIMARY KEY,
    emom_id         INT NOT NULL REFERENCES emoms(id),
    set_exercise_id INT REFERENCES set_exercises(id), -- NULL means rest
    duration        SMALLINT NOT NULL DEFAULT 60,     -- seconds
    position        SMALLINT NOT NULL
);


-- =============================================================================
-- hiit_sets
-- High-Intensity Interval Training block. Supports two types:
--   hiit    - flexible work/rest ratios (e.g. 40s work / 20s rest).
--   tabata  - strict 20s work / 10s rest, 8 rounds.
-- work and rest define the interval durations in seconds.
-- =============================================================================
CREATE TABLE hiit_sets (
    id                  SERIAL PRIMARY KEY,
    workout_block_id    INT NOT NULL UNIQUE REFERENCES workout_blocks(id),
    type                hiit_type NOT NULL,
    rounds              SMALLINT NOT NULL,
    work                SMALLINT NOT NULL, -- seconds
    rest                SMALLINT NOT NULL  -- seconds
);


-- =============================================================================
-- hiit_set_exercises
-- Join table linking a hiit_set to its exercises (ordered).
-- A NULL set_exercise_id represents a rest slot in the circuit.
-- =============================================================================
CREATE TABLE hiit_set_exercises (
    id              SERIAL PRIMARY KEY,
    hiit_set_id     INT NOT NULL REFERENCES hiit_sets(id),
    set_exercise_id INT REFERENCES set_exercises(id), -- NULL means rest
    position        SMALLINT NOT NULL
);


-- =============================================================================
-- routines
-- A named workout routine composed of ordered workout blocks.
-- Each block can be any type: straight set, timed set, emom, or hiit.
-- =============================================================================
CREATE TABLE routines (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    created_by  INT REFERENCES users(id),

    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- routine_blocks
-- Join table linking a routine to its workout blocks (ordered).
-- References workout_blocks as the single entry point for all block types.
-- =============================================================================
CREATE TABLE routine_blocks (
    id                  SERIAL PRIMARY KEY,
    routine_id          INT NOT NULL REFERENCES routines(id),
    workout_block_id    INT NOT NULL REFERENCES workout_blocks(id),
    position            SMALLINT NOT NULL
);
