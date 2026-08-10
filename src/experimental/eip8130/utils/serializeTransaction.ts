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
  AaCalls,
  AaChange,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../types/transaction.js'
import { encodeChangePayload } from './actorChangeData.js'
import {
  type AssertTransactionErrorType,
  assertTransaction,
} from './assertTransaction.js'

/** Encodes the `calls` field into a nested RLP-ready array. */
export function toCallsList(calls: AaCalls | undefined): RecursiveArray<Hex>[] {
  return (calls ?? []).map((phase) =>
    phase.map((call) => [call.to, call.data ?? '0x']),
  )
}

/**
 * Encodes a single `SignedAccountChanges` op into its `rlp([op_byte, payload])`
 * pair. `op_byte` is the `ChangeType` discriminant (`authorizeActor` = `0` →
 * RLP `0x80`).
 */
function toChange(change: AaChange): RecursiveArray<Hex> {
  return [
    change.changeType ? numberToHex(change.changeType) : '0x',
    encodeChangePayload(change),
  ]
}

/**
 * Encodes the `account_changes` field into a nested RLP-ready array.
 *
 * Per [EIP-8130] (base/base #3985), each AccountChange is a single flat RLP list
 * whose first element is the type discriminant, followed by the body fields
 * inline: `rlp([type_byte, ...fields])`. The type byte is a genuine list element
 * (RLP-encoded as an integer, so `create` = `0` → `0x80`), NOT an EIP-2718-style
 * bare prefix — so each entry frames as exactly one item in the outer
 * `account_changes` list.
 *
 * [EIP-8130]: https://eips.ethereum.org/EIPS/eip-8130
 */
export function toAccountChangesList(
  accountChanges: readonly AaAccountChange[] | undefined,
): RecursiveArray<Hex>[] {
  return (accountChanges ?? []).map((entry): RecursiveArray<Hex> => {
    if (entry.type === 'create')
      return [
        accountChangeType.create,
        entry.userSalt,
        entry.code,
        entry.initialActors.map((actor) => [
          actor.actorId,
          actor.authenticator,
          actor.scope ? numberToHex(actor.scope) : '0x',
          actor.policyData ?? '0x',
        ]),
      ]
    if (entry.type === 'config')
      return [
        accountChangeType.config,
        // channel byte: local = 0x00 (RLP '0x'), multichain = 0x01.
        entry.channel === 'multichain' ? '0x01' : '0x',
        entry.sequence ? numberToHex(entry.sequence) : '0x',
        entry.changes.map(toChange),
        entry.signature,
      ]
    return [accountChangeType.delegation, entry.target]
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
    validAfter,
    validBefore,
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
    validAfter ? numberToHex(validAfter) : '0x',
    validBefore ? numberToHex(validBefore) : '0x',
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? numberToHex(maxFeePerGas) : '0x',
    gas ? numberToHex(gas) : '0x',
    toAccountChangesList(accountChanges),
    toCallsList(calls),
    metadata ?? '0x',
  ]
}

export type SerializeTransactionErrorType =
  | AssertTransactionErrorType
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
export function serializeTransaction(
  transaction: TransactionSerializable8130,
): TransactionSerialized8130 {
  assertTransaction(transaction)

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
