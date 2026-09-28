import type { Frame } from '../types/frame.js'
import * as internal from './internal/transaction.js'

// biome-ignore lint/performance/noBarrelFile: public frame namespace
export { calls } from './calls.js'
export { expiry } from './expiry.js'
export { verify } from './verify.js'

/** Callback that prepares a frame and declares its signature entries. */
export type Definition = internal.Definition

/** A signature entry paired with its signing callback. */
export type Signature = internal.Signature

/**
 * Defines a signing frame or expands into multiple unsigned frames.
 * Preparation may invoke this callback more than once; keep it free of side effects.
 * - Docs: https://viem.sh/docs/frames/from
 * @example
 * ```ts
 * import { Frame } from 'viem/frames'
 *
 * const frame = Frame.from(({ signatureIndex }) => ({
 *   frame: { mode: 'verify', to: verifier, data: encodeValidation(signatureIndex) },
 *   signatures: [{
 *     scheme: 'secp256k1',
 *     signer: account.address,
 *     async sign({ hash }) {
 *       return account.sign({ hash })
 *     },
 *   }],
 * }))
 * ```
 * @param definition - Returns `frame` with signature entries, or `frames` to expand.
 * @returns A frame that wallet actions prepare before signing.
 */
export function from(definition: Definition): Frame {
  return {
    [internal.signing]: { prepare: definition },
  } as internal.SigningFrame
}

/**
 * Signs a frame against its prepared transaction without mutating either.
 * - Docs: https://viem.sh/docs/frames/sign
 * @param frame - The resolved frame object from the prepared transaction.
 * @param options - The complete transaction containing the frame.
 * @returns A signed frame to replace the original at the same position.
 */
export async function sign(
  frame: Frame,
  { transaction }: { transaction: internal.Transaction },
): Promise<Frame> {
  return internal.signFrame(frame, transaction)
}
