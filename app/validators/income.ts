import vine from '@vinejs/vine'

export const createIncomeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(255).optional(),
    amount_cents: vine.number().min(1),
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    categoryId: vine.number().min(1).nullable().optional(),
  })
)

export const patchIncomeValidator = vine.compile(
  vine.object({
    description: vine.string().trim().maxLength(255).nullable().optional(),
    amount_cents: vine.number().min(1).optional(),
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    categoryId: vine.number().min(1).nullable().optional(),
  })
)
