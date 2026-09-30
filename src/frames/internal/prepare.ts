import type { Address } from 'abitype'
import * as Frame_ox from 'ox/Frame'
import * as Hex from 'ox/Hex'
import type { Account, PrivateKeyAccount } from '../../accounts/types.js'
import { BaseError } from '../../errors/base.js'
import * as Frame from '../Frame.js'
import * as FrameTransaction from './transaction.js'

export function prepare<
  transaction extends {
    nonceKeys?: readonly (bigint | 'random')[] | undefined
    frameContext?: Frame.Context | undefined
    frames?: readonly Frame.Input[] | undefined
    signatures?: FrameTransaction.Transaction['signatures'] | undefined
  },
>(
  transaction: transaction,
  account: Account | Address | null | undefined,
): FrameTransaction.Resolved<transaction> {
  if (!transaction.frames)
    return FrameTransaction.resolve(transaction, { account })

  transaction = {
    ...transaction,
    nonceKeys: FrameTransaction.resolveNonceKeys(transaction.nonceKeys),
  }

  if (
    transaction.signatures?.length &&
    !FrameTransaction.hasSigningFrames(transaction)
  )
    return FrameTransaction.resolve(transaction, { account })

  const prepared = FrameTransaction.resolve(transaction, { account })
  const hasApproval = prepared.frames!.some(
    (frame) =>
      (Hex.toNumber(Frame_ox.toRpc(frame).flags) &
        Frame_ox.flags.approveExecution) !==
      0,
  )
  if (hasApproval) return prepared

  if (
    !account ||
    typeof account === 'string' ||
    account.type !== 'local' ||
    account.source !== 'privateKey' ||
    !account.sign
  )
    throw new BaseError(
      'Frame.verify: automatic execution approval requires a local private-key account.',
      {
        metaMessages: [
          "Pass an account created with `privateKeyToAccount` as the transaction account, or add a verification frame with `mode: 'verify'` and `flags: 'approveExecution'` or `'approveExecutionAndPayment'`.",
        ],
      },
    )

  const first = prepared.frames![0]
  const offset =
    (first?.mode === 'verify' || first?.mode === 1) &&
    first.to?.toLowerCase() === FrameTransaction.expiryVerifier
      ? 1
      : 0

  const inputs: Frame.Input[] = []
  for (let index = 0; index < prepared.frames!.length; index++) {
    const frame = prepared.frames![index]!
    const entry = prepared.frameContext?.entries[index]
    if (entry?.prepare) {
      inputs.push(entry.prepare)
      index += (entry.frameCount ?? 1) - 1
    } else
      inputs.push(() => ({
        frame,
        dataSuffix: entry?.dataSuffix
          ? (context) =>
              entry.dataSuffix!({
                ...context,
                index: entry.dataSuffixIndex ?? 0,
              })
          : undefined,
      }))
  }

  return FrameTransaction.resolve(
    {
      ...transaction,
      frameContext: undefined,
      frames: [
        ...inputs.slice(0, offset),
        Frame.verify({ account: account as PrivateKeyAccount }),
        ...inputs.slice(offset),
      ],
    },
    { account },
  ) as FrameTransaction.Resolved<transaction>
}
