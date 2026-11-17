import { Address, Hash, Hex } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'

import type * as Chain from '../../core/Chain.js'
import type { Transaction } from '../chainConfig.js'

const maxUint256 = 2n ** 256n - 1n

/**
 * Tempo transaction replacement semantics.
 *
 * - Protocol nonces (nonce key `0`, including Ethereum transaction types) and
 *   2D nonces occupy the sender's `(nonceKey, nonce)` slot.
 * - Expiring nonces are deduplicated by their expiring nonce hash, so a
 *   transaction is replaced only by another carrying the same sender payload
 *   (e.g. re-sponsored with a different fee payer signature or fee token).
 */
export const transactionReplacement = {
  getKey(transaction: Transaction) {
    if (transaction.type !== 'tempo') return `0:${transaction.nonce}`
    const nonceKey = transaction.nonceKey ?? 0n
    if (nonceKey === maxUint256)
      return `expiring:${getExpiringNonceHash(transaction)}`
    return `${nonceKey}:${transaction.nonce}`
  },
  getReason(options: { replaced: Transaction; replacement: Transaction }) {
    const { replaced, replacement } = options
    const calls = getCalls(replacement)
    const replacedCalls = getCalls(replaced)
    if (
      calls.length === replacedCalls.length &&
      calls.every((call, i) => isSameCall(call, replacedCalls[i]!))
    )
      return 'repriced'
    if (
      calls.every(
        (call) =>
          call.to &&
          Address.isEqual(call.to, replacement.from) &&
          !call.value &&
          isEmpty(call.data),
      )
    )
      return 'cancelled'
    return 'replaced'
  },
} as const satisfies Chain.Chain.Transaction.Replacement

/**
 * Returns the expiring nonce hash of a Tempo transaction:
 * `keccak256(encodeForSigning(tx) || sender)`. It excludes the fee payer
 * signature and fee token, so it is invariant to sponsorship.
 */
export function getExpiringNonceHash(
  transaction: Extract<Transaction, { type: 'tempo' }>,
) {
  const envelope = TxEnvelopeTempo.from({
    accessList: transaction.accessList,
    authorizationList: transaction.authorizationList,
    calls: transaction.calls,
    chainId: transaction.chainId,
    feePayerSignature: transaction.feePayerSignature ? null : undefined,
    feeToken: transaction.feeToken,
    gas: transaction.gas,
    keyAuthorization: transaction.keyAuthorization ?? undefined,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    nonce: transaction.nonce,
    nonceKey: transaction.nonceKey,
    validAfter: transaction.validAfter,
    validBefore: transaction.validBefore,
  })
  return Hash.keccak256(
    Hex.concat(TxEnvelopeTempo.encodeForSigning(envelope), transaction.from),
  )
}

type Call = {
  data?: Hex.Hex | undefined
  to?: Address.Address | null | undefined
  value?: bigint | undefined
}

function getCalls(transaction: Transaction): readonly Call[] {
  if (transaction.type === 'tempo') return transaction.calls
  return [
    { data: transaction.input, to: transaction.to, value: transaction.value },
  ]
}

function isSameCall(a: Call, b: Call) {
  return (
    (a.to && b.to ? Address.isEqual(a.to, b.to) : !a.to && !b.to) &&
    (a.value ?? 0n) === (b.value ?? 0n) &&
    (isEmpty(a.data) ? isEmpty(b.data) : a.data === b.data)
  )
}

function isEmpty(data: Hex.Hex | undefined) {
  return !data || data === '0x'
}
