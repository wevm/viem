import * as Hex from 'ox/Hex'
import { BaseError } from '../errors/base.js'
import type { Frame } from '../types/frame.js'
import { from } from './Frame.js'
import * as internal from './internal/transaction.js'

/**
 * Requires execution on or before a Unix timestamp in seconds.
 *
 * @example
 * ```ts
 * frames: [Frame.expiry(1_800_000_000), Frame.calls([{ to, value: 1n }])]
 * ```
 *
 * @param deadline - An unsigned 64-bit Unix timestamp in seconds.
 * @returns An expiry verifier that must be the first frame.
 */
export function expiry(deadline: number | bigint): Frame {
  if (typeof deadline === 'number' && !Number.isSafeInteger(deadline))
    throw new BaseError('Expiry must be a safe integer or bigint timestamp.')

  return from(() => ({
    frame: {
      data: Hex.fromNumber(deadline, { size: 8 }),
      flags: 'none',
      mode: 'verify',
      stateGas: 0n,
      to: internal.expiryVerifier,
    },
  }))
}
