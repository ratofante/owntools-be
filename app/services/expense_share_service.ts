import { inject } from '@adonisjs/core'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Expense from '#models/expense'
import type { SplitType } from '#models/expense'
import ExpenseShare from '#models/expense_share'

type ShareInput = { user_id: number; share_amount_cents: number }

function splitEqually(totalCents: number, memberCount: number): number[] {
  if (memberCount <= 0) throw new Error('memberCount must be > 0')
  const base = Math.floor(totalCents / memberCount)
  const remainder = totalCents % memberCount
  return Array.from({ length: memberCount }, (_, i) => (i < remainder ? base + 1 : base))
}

@inject()
export default class ExpenseShareService {
  validateCustomShares(totalCents: number, shares: number[]): void {
    const sum = shares.reduce((acc, s) => acc + s, 0)
    if (sum !== totalCents) {
      throw new Error(`Share amounts must sum to ${totalCents} cents, got ${sum}`)
    }
  }

  sharesNeedUpdate(
    currentSplitType: SplitType | null,
    currentAmountCents: number,
    currentShares: ExpenseShare[],
    incoming: {
      split_type: SplitType
      amount_cents: number
      custom_shares?: ShareInput[]
    }
  ): boolean {
    if (currentSplitType !== incoming.split_type) return true
    if (currentAmountCents !== incoming.amount_cents) return true

    if (incoming.split_type === 'custom') {
      if (!incoming.custom_shares) return true
      if (currentShares.length !== incoming.custom_shares.length) return true

      for (const inc of incoming.custom_shares) {
        const existing = currentShares.find((s) => s.userId === inc.user_id)
        if (!existing || existing.shareAmountCents !== inc.share_amount_cents) return true
      }
    }

    return false
  }

  async createShares(
    trx: TransactionClientContract,
    expenseId: number,
    payerUserId: number,
    amountCents: number,
    splitType: 'equal' | 'custom',
    memberIds: number[],
    customShares?: ShareInput[]
  ): Promise<void> {
    let shares: { userId: number; shareAmountCents: number; paidAmountCents: number }[]

    if (splitType === 'equal') {
      const amounts = splitEqually(amountCents, memberIds.length)
      shares = memberIds.map((userId, i) => ({
        userId,
        shareAmountCents: amounts[i]!,
        paidAmountCents: userId === payerUserId ? amountCents : 0,
      }))
    } else {
      shares = customShares!.map((s) => ({
        userId: s.user_id,
        shareAmountCents: s.share_amount_cents,
        paidAmountCents: s.user_id === payerUserId ? amountCents : 0,
      }))
    }

    await ExpenseShare.createMany(
      shares.map((s) => ({ ...s, expenseId })),
      { client: trx }
    )
  }

  async replaceEqualShares(
    trx: TransactionClientContract,
    expense: Expense,
    amountCents: number,
    memberIds: number[],
    currentShares: ExpenseShare[]
  ): Promise<void> {
    const amounts = splitEqually(amountCents, memberIds.length)
    const currentByUserId = new Map(currentShares.map((s) => [s.userId, s]))
    const incomingUserIds = new Set(memberIds)

    for (const share of currentShares) {
      if (!incomingUserIds.has(share.userId)) {
        share.useTransaction(trx)
        await share.delete()
      }
    }

    for (const [i, userId] of memberIds.entries()) {
      const existing = currentByUserId.get(userId)
      const shareAmountCents = amounts[i]!
      const paidAmountCents = userId === expense.paidByUserId ? amountCents : 0

      if (existing) {
        existing.useTransaction(trx)
        existing.shareAmountCents = shareAmountCents
        existing.paidAmountCents = paidAmountCents
        await existing.save()
      } else {
        await ExpenseShare.create(
          {
            expenseId: expense.id,
            userId,
            shareAmountCents,
            paidAmountCents,
          },
          { client: trx }
        )
      }
    }
  }

  async replaceCustomShares(
    trx: TransactionClientContract,
    expense: Expense,
    amountCents: number,
    customShares: ShareInput[],
    currentShares: ExpenseShare[]
  ): Promise<void> {
    const currentByUserId = new Map(currentShares.map((s) => [s.userId, s]))
    const incomingUserIds = new Set(customShares.map((s) => s.user_id))

    for (const share of currentShares) {
      if (!incomingUserIds.has(share.userId)) {
        share.useTransaction(trx)
        await share.delete()
      }
    }

    for (const incoming of customShares) {
      const existing = currentByUserId.get(incoming.user_id)
      const paidAmountCents = incoming.user_id === expense.paidByUserId ? amountCents : 0

      if (existing) {
        existing.useTransaction(trx)
        existing.shareAmountCents = incoming.share_amount_cents
        existing.paidAmountCents = paidAmountCents
        await existing.save()
      } else {
        await ExpenseShare.create(
          {
            expenseId: expense.id,
            userId: incoming.user_id,
            shareAmountCents: incoming.share_amount_cents,
            paidAmountCents,
          },
          { client: trx }
        )
      }
    }
  }
}
