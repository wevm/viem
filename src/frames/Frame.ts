import * as Frame_ox from 'ox/Frame'
import type { PrivateKeyAccount } from '../accounts/types.js'
import { BaseError } from '../errors/base.js'
import type { Frame } from '../types/frame.js'
import * as internal from './internal/transaction.js'

// biome-ignore lint/performance/noBarrelFile: public frame namespace
export { calls } from './calls.js'
export { expiry } from './expiry.js'

export type Definition = internal.Definition

/** A signature entry paired with its signing callback. */
export type Signature = internal.Signature

/** Defines a signing frame or expands into multiple unsigned frames.
 * @example
 * ```ts
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

/** Signs a frame against its prepared transaction without mutating either. */
export async function sign(
  frame: Frame,
  { transaction }: { transaction: internal.Transaction },
): Promise<Frame> {
  return internal.signFrame(frame, transaction)
}

/** Creates execution approval for a default account, including payment unless another frame approves payment. */
export function verify({
  account,
  ...frame
}: { account: PrivateKeyAccount } & Pick<
  Frame,
  'executionGas' | 'stateGas'
>): Frame {
  return from(({ frames }) => {
    const hasPayer = frames.some(
      (candidate) =>
        candidate.flags === 'approvePayment' ||
        candidate.flags === Frame_ox.flags.approvePayment,
    )

    return {
      frame: {
        ...frame,
        flags: hasPayer ? 'approveExecution' : 'approveExecutionAndPayment',
        mode: 'verify',
        to: account.address,
      },
      signatures: [
        {
          scheme: 'secp256k1',
          signer: account.address,
          async sign({ hash, signatureIndex }) {
            if (signatureIndex !== 0)
              throw new BaseError(
                'Default-account execution approval requires signature index 0.',
              )

            return account.sign({ hash })
          },
        },
      ],
    }
  })
}
