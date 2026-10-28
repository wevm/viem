import * as Hex from 'ox/Hex'
import { TxEnvelopeTempo } from 'ox/tempo'
import type { ReplacementReason } from '../../actions/public/waitForTransactionReceipt.js'
import { maxUint256 } from '../../constants/number.js'
import type { ChainTransactionReplacement } from '../../types/chain.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import type { Transaction } from '../Transaction.js'

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
  getKey(transaction) {
    const tx = transaction as Transaction
    if (tx.type !== 'tempo') return `0:${tx.nonce}`
    const nonceKey = tx.nonceKey ?? 0n
    if (nonceKey === maxUint256) return `expiring:${getExpiringNonceHash(tx)}`
    return `${nonceKey}:${tx.nonceExact ?? tx.nonce}`
  },
  getReason({ replaced, replacement }) {
    return getReason(replaced as Transaction, replacement as Transaction)
  },
} as const satisfies ChainTransactionReplacement

/**
 * Returns the expiring nonce hash of a Tempo transaction:
 * `keccak256(encodeForSigning(tx) || sender)`. It excludes the fee payer
 * signature and fee token, so it is invariant to sponsorship.
 *
 * @internal
 */
export function getExpiringNonceHash(transaction: Transaction) {
  const tx = transaction as Extract<Transaction, { type: 'tempo' }>
  const envelope = TxEnvelopeTempo.from({
    accessList: tx.accessList,
    authorizationList: tx.authorizationList,
    calls: tx.calls,
    chainId: tx.chainId,
    feePayerSignature: tx.feePayerSignature ? null : undefined,
    feeToken: tx.feeToken,
    gas: tx.gas,
    keyAuthorization: tx.keyAuthorization ?? undefined,
    maxFeePerGas: tx.maxFeePerGas,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    nonce: tx.nonceExact ?? BigInt(tx.nonce),
    nonceKey: tx.nonceKey,
    validAfter: tx.validAfter,
    validBefore: tx.validBefore,
  })
  return keccak256(
    Hex.concat(TxEnvelopeTempo.encodeForSigning(envelope), tx.from),
  )
}

function getReason(
  replaced: Transaction,
  replacement: Transaction,
): ReplacementReason {
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
        isAddressEqual(call.to, replacement.from) &&
        !call.value &&
        isEmpty(call.data),
    )
  )
    return 'cancelled'
  return 'replaced'
}

type Call = {
  data?: Hex.Hex | undefined
  to?: Hex.Hex | null | undefined
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
    (a.to && b.to ? isAddressEqual(a.to, b.to) : !a.to && !b.to) &&
    (a.value ?? 0n) === (b.value ?? 0n) &&
    (isEmpty(a.data) ? isEmpty(b.data) : a.data === b.data)
  )
}

function isEmpty(data: Hex.Hex | undefined) {
  return !data || data === '0x'
}
