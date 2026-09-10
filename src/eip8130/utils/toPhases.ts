import type { AaCall, AaCalls } from '../types/transaction.js'

/**
 * Normalizes a `calls` input into ordered phases ({@link AaCalls}).
 *
 * Accepts either a flat list of calls (`readonly AaCall[]`) — run as a single
 * atomic phase — or an already-phased nested array (`AaCalls`), which is passed
 * through unchanged. A flat call is an object (`{ to, ... }`) while a phase is
 * an array, so the two shapes are unambiguous.
 *
 * Shared by `sendTransaction`, `estimateGas`, and the `eip8130ChainConfig`
 * request hook so every entry point accepts the same `calls` shape.
 */
export function toPhases(
  calls: readonly AaCall[] | AaCalls | undefined,
): AaCalls {
  if (!calls || calls.length === 0) return []
  // Already phased (array of arrays)?
  if (Array.isArray(calls[0])) return calls as AaCalls
  return [calls as readonly AaCall[]]
}
