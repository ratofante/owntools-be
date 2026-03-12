import vine from '@vinejs/vine'

const setExerciseInput = vine.object({
  exerciseId: vine.number(),
  repetitions: vine.number().nullable(),
  percentage: vine.number().nullable(),
  targetWeight: vine.number().nullable(),
})

const workoutBlockSchema = vine.union([
  vine.union.if(
    (value) => vine.helpers.isObject(value) && value.blockType === 'straight_set',
    vine.object({
      blockType: vine.enum(['straight_set']),
      name: vine.string().nullable(),
      workout: vine.object({
        sets: vine.number(),
        rest: vine.number().nullable(),
        setExercise: setExerciseInput,
      }),
    })
  ),
  vine.union.if(
    (value) => vine.helpers.isObject(value) && value.blockType === 'timed_set',
    vine.object({
      blockType: vine.enum(['timed_set']),
      name: vine.string().nullable(),
      workout: vine.object({
        type: vine.enum(['amrap', 'chipper']),
        time: vine.number(),
        setExercises: vine.array(setExerciseInput),
      }),
    })
  ),
  vine.union.if(
    (value) => vine.helpers.isObject(value) && value.blockType === 'emom',
    vine.object({
      blockType: vine.enum(['emom']),
      name: vine.string().nullable(),
      workout: vine.object({
        rounds: vine.number().nullable(),
        intervals: vine.array(
          vine.object({
            duration: vine.number(),
            setExercise: setExerciseInput,
          })
        ),
      }),
    })
  ),
  vine.union.else(
    vine.object({
      blockType: vine.enum(['hiit']),
      name: vine.string().nullable(),
      workout: vine.object({
        rounds: vine.number(),
        work: vine.number(),
        rest: vine.number(),
        setExercises: vine.array(setExerciseInput),
      }),
    })
  ),
])

export const createRoutineValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    createdBy: vine.number().nullable(),
    workoutBlocks: vine.array(workoutBlockSchema),
  })
)
