import vine from '@vinejs/vine'
import { WALLET_TYPES } from '#models/wallet'

export const createWalletValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(50),
    wallet_type: vine.enum(WALLET_TYPES),
    userIds: vine.array(vine.number()).minLength(1),
  })
)
