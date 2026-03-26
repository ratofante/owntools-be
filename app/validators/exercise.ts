import vine from '@vinejs/vine'

export const allExerciseValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).max(100).optional(),
    searchName: vine.string().optional(),
    createdAtSort: vine.enum(['asc', 'desc']).optional(),
    createdBy: vine.number().min(1).optional(),
    bodyZones: vine
      .any()
      .transform((value) => {
        const str = Array.isArray(value) ? value.join(',') : String(value)
        return str.split(',').map((id) => Number(id))
      })
      .optional(),
    muscleGroups: vine
      .any()
      .transform((value) => {
        const str = Array.isArray(value) ? value.join(',') : String(value)
        return str.split(',').map((id) => Number(id))
      })
      .optional(),
  })
)

export const exerciseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    description: vine.string().minLength(3).maxLength(255).nullable(),
    videoUrl: vine.string().url().nullable(),
    bodyZones: vine.array(
      vine.object({
        id: vine.number(),
        zone_importance: vine.enum(['primary', 'secondary']),
      })
    ),
    muscleGroups: vine.array(
      vine.object({
        id: vine.number(),
        involvement_level: vine.enum(['primary', 'secondary']),
      })
    ),
  })
)
