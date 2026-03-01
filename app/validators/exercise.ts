import vine from '@vinejs/vine'

export const allExerciseValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).max(100).optional(),
    searchName: vine.string().optional(),
    createdAtSort: vine.enum(['asc', 'desc']).optional(),
    createdBy: vine.number().min(1).optional(),
  })
)

export const createExerciseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    description: vine.string().minLength(3).maxLength(255).nullable(),
    videoUrl: vine.string().url().nullable(),
  })
)

export const updateExerciseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50).optional(),
    description: vine.string().minLength(3).maxLength(255).nullable().optional(),
    videoUrl: vine.string().url().nullable().optional(),
  })
)
