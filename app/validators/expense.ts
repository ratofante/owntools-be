import vine from '@vinejs/vine'

export const createExpenseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(255).optional(),
    amount_cents: vine.number().min(1),
    is_shared: vine.boolean(),
    split_type: vine.enum(['equal', 'custom'] as const).optional(),
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    categoryId: vine.number().min(1).nullable().optional(),
    custom_shares: vine
      .array(
        vine.object({
          user_id: vine.number().min(1),
          share_amount_cents: vine.number().min(1),
        })
      )
      .optional(),
  })
)

/** Partial update for personal expenses only. */
export const patchExpenseValidator = vine.compile(
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

/** Full replacement body for shared expenses (PUT). */
export const putSharedExpenseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(255).nullable().optional(),
    amount_cents: vine.number().min(1),
    date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    split_type: vine.enum(['equal', 'custom'] as const),
    categoryId: vine.number().min(1).nullable().optional(),
    custom_shares: vine
      .array(
        vine.object({
          user_id: vine.number().min(1),
          share_amount_cents: vine.number().min(1),
        })
      )
      .optional(),
  })
)
