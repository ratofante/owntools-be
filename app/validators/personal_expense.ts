import vine from '@vinejs/vine'

export const personalWalletValidator = vine.compile(
  vine.object({
    userId: vine.number().min(1),
  })
)

export const addPersonalExpenseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(255).optional(),
    amount_cents: vine.number().min(1),
    date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    categoryId: vine.number().nullable(),
  })
)
