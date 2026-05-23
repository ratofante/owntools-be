import vine from '@vinejs/vine'

export const personalWalletValidator = vine.compile(
  vine.object({
    userId: vine.number().min(1),
  })
)
