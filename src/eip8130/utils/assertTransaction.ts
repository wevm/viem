import { BaseError } from '../../errors/base.js'
import { InvalidChainIdError } from '../../errors/chain.js'
import type { ErrorType } from '../../errors/utils.js'
import { size } from '../../utils/data/size.js'
import { nonceKeyMax, openPayer } from '../constants.js'
import type { TransactionSerializable8130 } from '../types/transaction.js'

export type AssertTransactionErrorType =
  | InvalidChainIdError
  | BaseError
  | ErrorType

/**
 * Validates the structural invariants of an AA transaction prior to
 * serialization or hashing.
 */
export function assertTransaction(
  transaction: TransactionSerializable8130,
): void {
  const {
    accountChanges,
    chainId,
    nonceKey,
    nonceSequence,
    validBefore,
    payer,
    payerAuth,
  } = transaction

  if (chainId <= 0) throw new InvalidChainIdError({ chainId })

  // Nonce-free mode (`NONCE_KEY_MAX`): sequence must be 0 and validBefore non-zero.
  if (typeof nonceKey === 'bigint' && nonceKey === nonceKeyMax) {
    if (nonceSequence !== undefined && nonceSequence !== 0n)
      throw new BaseError(
        '`nonceSequence` must be `0n` when `nonceKey` is `nonceKeyMax` (nonce-free mode).',
      )
    if (!validBefore || validBefore === 0n)
      throw new BaseError(
        '`validBefore` must be non-zero when `nonceKey` is `nonceKeyMax` (nonce-free mode).',
      )
  }

  if (
    accountChanges &&
    accountChanges.filter((entry) => entry.type === 'delegation').length > 1
  )
    throw new BaseError('At most one `delegation` account change is allowed.')

  // Self-pay (no `payer`) must not carry a `payerAuth`.
  if (!payer && payerAuth && payerAuth !== '0x')
    throw new BaseError(
      '`payerAuth` must be empty for self-pay transactions (no `payer` set).',
    )

  // Open payer: the payer is recovered, so `payerAuth` is a raw 65-byte signature.
  if (payer === openPayer && payerAuth && payerAuth !== '0x')
    if (size(payerAuth) !== 65)
      throw new BaseError(
        '`payerAuth` must be a raw 65-byte signature in open payer mode (`payer: openPayer`).',
      )
}
