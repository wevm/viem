import { timestampMsThreshold } from '../constants.js'

/**
 * Normalizes a validity bound (`validAfter` / `validBefore`) to unix
 * **milliseconds**, per EIP-8130 Timestamp Normalization: `0` (no bound) is kept,
 * a non-zero value below {@link timestampMsThreshold} is seconds and is scaled
 * by `1000`, and anything else is already milliseconds.
 *
 * @param value - The raw bound, as signed.
 * @returns The bound in unix milliseconds.
 */
export function normalizeTimestampMs(value: bigint): bigint {
  if (value === 0n || value >= timestampMsThreshold) return value
  return value * 1000n
}
