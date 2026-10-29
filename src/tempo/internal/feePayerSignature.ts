/**
 * Zero fee payer signature that marks a request whose fee payer signs later.
 *
 * From T14, `eth_estimateGas` and `eth_fillTransaction` add the fee payer's
 * account access to the estimate of a request that carries it, and
 * `eth_fillTransaction` returns it in the filled transaction.
 *
 * @internal
 */
export const marker = { r: '0x0', s: '0x0', yParity: '0x0' } as const

/**
 * Returns whether an RPC fee payer signature is the {@link marker}.
 *
 * @internal
 */
export function isMarker(signature: unknown): boolean {
  if (!signature || typeof signature !== 'object') return false
  const { r, s, yParity } = signature as Record<string, unknown>
  const isZero = (value: unknown) => {
    if (typeof value === 'number' || typeof value === 'bigint')
      return BigInt(value) === 0n
    if (typeof value === 'string' && /^0x[0-9a-fA-F]*$/.test(value))
      return BigInt(value === '0x' ? 0 : value) === 0n
    return false
  }
  return isZero(r) && isZero(s) && isZero(yParity ?? 0)
}
