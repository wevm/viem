import type { Address } from 'abitype'
import * as Frame_ox from 'ox/Frame'
import * as Hex from 'ox/Hex'
import type { Account, PrivateKeyAccount } from '../../accounts/types.js'
import { BaseError } from '../../errors/base.js'
import type { Frame } from '../../types/frame.js'
import { verify } from '../Frame.js'
import {
  expiryVerifier,
  resolve,
  type SigningFrame,
  signing,
  type Transaction,
} from './transaction.js'

export function prepare<
  transaction extends {
    nonceKeys?: readonly bigint[] | undefined
    frames?: readonly Frame[] | undefined
    signatures?: Transaction['signatures'] | undefined
  },
>(
  transaction: transaction,
  account: Account | Address | null | undefined,
): transaction {
  if (!transaction.frames) return transaction

  if (transaction.nonceKeys === undefined)
    transaction = { ...transaction, nonceKeys: [0n] }

  if (
    transaction.signatures?.length &&
    !transaction.frames?.some((frame) => (frame as SigningFrame)[signing])
  )
    return transaction

  const prepared = resolve(transaction)
  const hasApproval = prepared.frames!.some(
    (frame) =>
      (Hex.toNumber(Frame_ox.toRpc(frame).flags) &
        Frame_ox.flags.approveExecution) !==
      0,
  )
  if (hasApproval) return resolve(prepared)

  if (
    !account ||
    typeof account === 'string' ||
    account.type !== 'local' ||
    account.source !== 'privateKey' ||
    !account.sign
  )
    throw new BaseError(
      'Cannot add verification automatically for this account.',
      {
        metaMessages: [
          "Pass an account created with `privateKeyToAccount` as the transaction account, or add a verification frame with `mode: 'verify'` and `flags: 'approveExecution'` or `'approveExecutionAndPayment'`.",
        ],
      },
    )

  const first = prepared.frames![0]
  const offset =
    (first?.mode === 'verify' || first?.mode === 1) &&
    first.to?.toLowerCase() === expiryVerifier
      ? 1
      : 0

  return resolve({
    ...transaction,
    frames: [
      ...prepared.frames!.slice(0, offset),
      verify({ account: account as PrivateKeyAccount }),
      ...prepared.frames!.slice(offset),
    ],
  })
}
