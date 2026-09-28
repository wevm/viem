import * as Frame_ox from 'ox/Frame'
import type { PrivateKeyAccount } from '../accounts/types.js'
import { BaseError } from '../errors/base.js'
import type { Frame } from '../types/frame.js'
import { from } from './Frame.js'

/**
 * Creates execution approval for a default account, including payment unless another frame approves payment.
 * - Docs: https://viem.sh/docs/frames/verify
 * @param options - The private-key account and optional frame gas budgets.
 * @returns A verification helper that signs the finalized transaction.
 */
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
