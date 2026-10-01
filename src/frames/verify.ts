import * as Frame_ox from 'ox/Frame'
import type { PrivateKeyAccount } from '../accounts/types.js'
import { BaseError } from '../errors/base.js'
import type { Frame as Frame_ } from '../types/frame.js'
import * as Frame from './Frame.js'

/**
 * Creates execution approval for a default account, including payment unless another frame approves payment.
 * - Docs: https://viem.sh/docs/frames/verify
 * @param options - The private-key account and optional frame gas budgets.
 * @returns A verification helper that signs the finalized transaction.
 */
export function verify(options: verify.Options) {
  const { account, ...frame } = options

  return Frame.from(function prepare(context) {
    const { entries } = context
    const hasPayer = entries.some(
      (candidate) =>
        candidate.prepare !== prepare &&
        (candidate.frame.flags === 'approvePayment' ||
          candidate.frame.flags === 'approveExecutionAndPayment' ||
          (typeof candidate.frame.flags === 'number' &&
            (candidate.frame.flags & Frame_ox.flags.approvePayment) !== 0)),
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
          async sign(parameters) {
            const { hash, signatureIndex } = parameters
            if (signatureIndex !== 0)
              throw new BaseError(
                'Frame.verify: default-account execution approval requires `signatureIndex` 0.',
              )

            return account.sign({ hash })
          },
        },
      ],
    }
  })
}

export declare namespace verify {
  /** Account and gas budgets for execution approval. */
  type Options = {
    /** Account that signs the transaction. */
    account: PrivateKeyAccount
  } & Pick<Frame_, 'executionGas' | 'stateGas'>
}
