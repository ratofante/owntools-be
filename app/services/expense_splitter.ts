/**
 * Splits totalCents equally among memberCount members.
 * The remainder (totalCents % memberCount) is distributed one cent at a time
 * to the first N members so that the sum always equals totalCents exactly.
 *
 * Example: splitEqually(5000, 3) → [1667, 1667, 1666]
 */
export function splitEqually(totalCents: number, memberCount: number): number[] {
  if (memberCount <= 0) throw new Error('memberCount must be > 0')
  const base = Math.floor(totalCents / memberCount)
  const remainder = totalCents % memberCount
  return Array.from({ length: memberCount }, (_, i) => (i < remainder ? base + 1 : base))
}

/**
 * Validates that the provided custom share amounts sum to totalCents.
 * Throws if they don't — call this before inserting custom shares.
 */
export function validateCustomShares(totalCents: number, shares: number[]): void {
  const sum = shares.reduce((acc, s) => acc + s, 0)
  if (sum !== totalCents) {
    throw new Error(`Share amounts must sum to ${totalCents} cents, got ${sum}`)
  }
}
