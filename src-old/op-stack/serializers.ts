import { InvalidAddressError } from '../errors/address.js'
import type { ErrorType } from '../errors/utils.js'
import type { ChainSerializers } from '../types/chain.js'
import type { Hex, Signature } from '../types/misc.js'
import type { TransactionSerializable } from '../types/transaction.js'
import type { RequiredBy } from '../types/utils.js'
import { isAddress } from '../utils/address/isAddress.js'
import { concatHex } from '../utils/data/concat.js'
import { toHex } from '../utils/encoding/toHex.js'
import { toRlp } from '../utils/encoding/toRlp.js'
import {
  type SerializeTransactionErrorType as SerializeTransactionErrorType_,
  serializeTransaction as serializeTransaction_,
} from '../utils/transaction/serializeTransaction.js'
import type {
  OpStackTransactionSerializable,
  TransactionSerializableDeposit,
  TransactionSerializedDeposit,
} from './types/transaction.js'

export type SerializeTransactionReturnType = ReturnType<
  typeof serializeTransaction
>

export type SerializeTransactionErrorType =
  | SerializeTransactionErrorType_
  | ErrorType

export function serializeTransaction(
  transaction: OpStackTransactionSerializable,
  signature?: Signature,
) {
  if (isDeposit(transaction)) return serializeTransactionDeposit(transaction)
  return serializeTransaction_(
    transaction as TransactionSerializable,
    signature,
  )
}

export const serializers = {
  transaction: serializeTransaction,
} as const satisfies ChainSerializers

//////////////////////////////////////////////////////////////////////////////
// Serializers

export type SerializeTransactionDepositReturnType = TransactionSerializedDeposit

function serializeTransactionDeposit(
  transaction: TransactionSerializableDeposit,
): SerializeTransactionDepositReturnType {
  assertTransactionDeposit(transaction)

  const { sourceHash, data, from, gas, isSystemTx, mint, to, value } =
    transaction

  const serializedTransaction: Hex[] = [
    sourceHash,
    from,
    to ?? '0x',
    mint ? toHex(mint) : '0x',
    value ? toHex(value) : '0x',
    gas ? toHex(gas) : '0x',
    isSystemTx ? '0x1' : '0x',
    data ?? '0x',
  ]

  return concatHex([
    '0x7e',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionDepositReturnType
}

function isDeposit(
  transaction: OpStackTransactionSerializable,
): transaction is RequiredBy<TransactionSerializableDeposit, 'type'> {
  if (transaction.type === 'deposit') return true
  if (typeof transaction.sourceHash !== 'undefined') return true
  return false
}

export function assertTransactionDeposit(
  transaction: TransactionSerializableDeposit,
) {
  const { from, to } = transaction
  if (from && !isAddress(from)) throw new InvalidAddressError({ address: from })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
}
