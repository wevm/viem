import { BaseError } from '../../../errors/base.js'
import { InvalidChainIdError } from '../../../errors/chain.js'
import type { ErrorType } from '../../../errors/utils.js'
import { nonceKeyMax } from '../constants.js'
import type { TransactionSerializable8130 } from '../types/transaction.js'

export type AssertTransaction8130ErrorType =
  | InvalidChainIdError
  | BaseError
  | ErrorType

/**
 * Validates the structural invariants of an EIP-8130 transaction prior to
 * serialization or hashing.
 */
export function assertTransaction8130(
  transaction: TransactionSerializable8130,
): void {
  const { chainId, nonceKey, nonceSequence, expiry, payer, payerAuth, calls } =
    transaction

  if (chainId <= 0) throw new InvalidChainIdError({ chainId })

  // EIP-8130 calls carry no value on the wire. A non-zero `value` here means it
  // was not realized through the wallet bytecode (e.g. `executeBatch`) and would
  // be silently dropped — reject instead. See `encodeWalletCalls`.
  if (calls)
    for (const phase of calls)
      for (const call of phase)
        if (call.value && call.value !== 0n)
          throw new BaseError(
            'EIP-8130 calls cannot carry `value` on the wire. Route value-bearing calls through the account wallet (e.g. `encodeWalletCalls` / `sendCalls8130`).',
          )

  // Nonce-free mode (`NONCE_KEY_MAX`): sequence must be 0 and expiry non-zero.
  if (typeof nonceKey === 'bigint' && nonceKey === nonceKeyMax) {
    if (nonceSequence !== undefined && nonceSequence !== 0n)
      throw new BaseError(
        '`nonceSequence` must be `0n` when `nonceKey` is `nonceKeyMax` (nonce-free mode).',
      )
    if (!expiry || expiry === 0n)
      throw new BaseError(
        '`expiry` must be non-zero when `nonceKey` is `nonceKeyMax` (nonce-free mode).',
      )
  }

  // Self-pay (no `payer`) must not carry a `payerAuth`.
  if (!payer && payerAuth && payerAuth !== '0x')
    throw new BaseError(
      '`payerAuth` must be empty for self-pay transactions (no `payer` set).',
    )
}
