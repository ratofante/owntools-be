import vine from '@vinejs/vine'

export const createExpenseValidator = vine.compile(
  vine.object({
    description: vine.string().trim().minLength(1).maxLength(255),
    // Amount in cents — frontend should convert before sending
    amount_cents: vine.number().min(1),
    is_shared: vine.boolean(),
    // Required only when is_shared is true
    split_type: vine.enum(['equal', 'custom'] as const).optional(),
    // YYYY-MM-DD string, defaults to today if omitted
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    // Required only when split_type === 'custom'
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

export const updateExpenseValidator = vine.compile(
  vine.object({
    description: vine.string().trim().minLength(1).maxLength(255).optional(),
    amount_cents: vine.number().min(1).optional(),
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
)

/** Partial update — each field optional; caller must enforce at least one patch key present. */
export const patchExpenseValidator = vine.compile(
  vine.object({
    description: vine.string().trim().minLength(1).maxLength(255).optional(),
    amount_cents: vine.number().min(1).optional(),
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    categoryId: vine.number().min(1).nullable().optional(),
  })
)
