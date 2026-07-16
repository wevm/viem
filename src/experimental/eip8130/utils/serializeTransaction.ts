import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import {
  type ConcatHexErrorType,
  concatHex,
} from '../../../utils/data/concat.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../../utils/encoding/toHex.js'
import {
  type RecursiveArray,
  type ToRlpErrorType,
  toRlp,
} from '../../../utils/encoding/toRlp.js'
import { aaTransactionType, accountChangeType } from '../constants.js'
import type {
  AaAccountChange,
  AaActorChange,
  AaCalls,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../types/transaction.js'
import { encodeActorChangeData } from './actorChangeData.js'
import {
  type AssertTransaction8130ErrorType,
  assertTransaction8130,
} from './assertTransaction.js'

/** Encodes the `calls` field into a nested RLP-ready array. */
export function toCallsList(calls: AaCalls | undefined): RecursiveArray<Hex>[] {
  return (calls ?? []).map((phase) =>
    phase.map((call) => [call.to, call.data ?? '0x']),
  )
}

/** Encodes a single `actor_change` operation into a nested RLP-ready array. */
function toActorChange(change: AaActorChange): RecursiveArray<Hex> {
  return [
    numberToHex(change.changeType),
    change.actorId,
    encodeActorChangeData(change),
  ]
}

/**
 * Encodes the `account_changes` field into a flat RLP-ready array.
 *
 * Each AccountChange is encoded on the wire as `type_byte || rlp([fields...])`:
 * the type byte is a raw prefix, NOT wrapped in its own RLP list. To produce
 * this with `toRlp`, we flatMap each entry into two sibling items in the outer
 * list: the type-byte hex string (encodes as a single raw byte ≤ 0x7f) and
 * the body array (encodes as an RLP list of fields).
 */
export function toAccountChangesList(
  accountChanges: readonly AaAccountChange[] | undefined,
): RecursiveArray<Hex>[] {
  return (accountChanges ?? []).flatMap((entry): RecursiveArray<Hex>[] => {
    if (entry.type === 'create')
      return [
        accountChangeType.create,
        [
          entry.userSalt,
          entry.code,
          entry.initialActors.map((actor) => [
            actor.actorId,
            actor.authenticator,
            actor.scope ? numberToHex(actor.scope) : '0x',
            actor.policyData ?? '0x',
          ]),
        ],
      ]
    if (entry.type === 'config')
      return [
        accountChangeType.config,
        [
          entry.chainId ? numberToHex(entry.chainId) : '0x',
          entry.sequence ? numberToHex(entry.sequence) : '0x',
          entry.actorChanges.map(toActorChange),
          entry.auth,
        ],
      ]
    return [accountChangeType.delegation, [entry.target]]
  })
}

/**
 * Returns the RLP-ready field array for the transaction body **through `calls`**
 * (i.e. excluding `payer`, `sender_auth`, and `payer_auth`). This is the body
 * used for the payer signature hash, and the prefix shared by the sender hash
 * and the full envelope.
 */
export function toTransactionBody(
  transaction: TransactionSerializable8130,
): RecursiveArray<Hex>[] {
  const {
    chainId,
    from,
    nonceKey,
    nonceSequence,
    expiry,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    accountChanges,
    calls,
    metadata,
  } = transaction
  return [
    numberToHex(chainId),
    from ?? '0x',
    nonceKey ? numberToHex(nonceKey) : '0x',
    nonceSequence ? numberToHex(nonceSequence) : '0x',
    expiry ? numberToHex(expiry) : '0x',
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? numberToHex(maxFeePerGas) : '0x',
    gas ? numberToHex(gas) : '0x',
    toAccountChangesList(accountChanges),
    toCallsList(calls),
    metadata ?? '0x',
  ]
}

export type SerializeTransaction8130ErrorType =
  | AssertTransaction8130ErrorType
  | ConcatHexErrorType
  | NumberToHexErrorType
  | ToRlpErrorType
  | ErrorType

/**
 * Serializes an EIP-8130 (`AA_TX_TYPE`) transaction into its EIP-2718 envelope.
 *
 * Requires `senderAuth`. For sponsored transactions, also provide `payer` and
 * `payerAuth`; omit both for self-pay.
 */
export function serializeTransaction8130(
  transaction: TransactionSerializable8130,
): TransactionSerialized8130 {
  assertTransaction8130(transaction)

  const { payer, senderAuth, payerAuth } = transaction

  return concatHex([
    aaTransactionType,
    toRlp([
      ...toTransactionBody(transaction),
      payer ?? '0x',
      senderAuth ?? '0x',
      payerAuth ?? '0x',
    ]),
  ]) as TransactionSerialized8130
}
