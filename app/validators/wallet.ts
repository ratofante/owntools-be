import vine from '@vinejs/vine'

export const createWalletValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(50),
    userIds: vine.array(vine.number()).minLength(1),
  })
)
