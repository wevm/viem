import { InvalidSerializedTransactionError } from '../errors/transaction.js'
import type { ErrorType } from '../errors/utils.js'
import { isHex } from '../utils/data/isHex.js'
import { size } from '../utils/data/size.js'
import { sliceHex } from '../utils/data/slice.js'
import { hexToBigInt, hexToBool } from '../utils/encoding/fromHex.js'
import type { GetSerializedTransactionType } from '../utils/transaction/getSerializedTransactionType.js'
import {
  type ParseTransactionErrorType as ParseTransactionErrorType_,
  type ParseTransactionReturnType as ParseTransactionReturnType_,
  parseTransaction as parseTransaction_,
  toTransactionArray,
} from '../utils/transaction/parseTransaction.js'
import { assertTransactionDeposit } from './serializers.js'
import type {
  OpStackTransactionSerialized,
  OpStackTransactionType,
  TransactionSerializableDeposit,
  TransactionSerializablePostExec,
  TransactionSerializedDeposit,
  TransactionSerializedPostExec,
} from './types/transaction.js'

export type ParseTransactionReturnType<
  serialized extends
    OpStackTransactionSerialized = OpStackTransactionSerialized,
  type extends
    OpStackTransactionType = GetSerializedTransactionType<serialized>,
> = serialized extends TransactionSerializedDeposit
  ? TransactionSerializableDeposit
  : serialized extends TransactionSerializedPostExec
    ? TransactionSerializablePostExec
    : ParseTransactionReturnType_<serialized, type>

export type ParseTransactionErrorType = ParseTransactionErrorType_ | ErrorType

export function parseTransaction<
  serialized extends OpStackTransactionSerialized,
>(serializedTransaction: serialized): ParseTransactionReturnType<serialized> {
  const serializedType = sliceHex(serializedTransaction, 0, 1)

  if (serializedType === '0x7e')
    return parseTransactionDeposit(
      serializedTransaction as TransactionSerializedDeposit,
    ) as ParseTransactionReturnType<serialized>

  if (serializedType === '0x7d')
    return parseTransactionPostExec(
      serializedTransaction as TransactionSerializedPostExec,
    ) as ParseTransactionReturnType<serialized>

  return parseTransaction_(
    serializedTransaction,
  ) as ParseTransactionReturnType<serialized>
}

function parseTransactionDeposit(
  serializedTransaction: TransactionSerializedDeposit,
): ParseTransactionReturnType<TransactionSerializedDeposit> {
  const transactionArray = toTransactionArray(serializedTransaction)

  const [sourceHash, from, to, mint, value, gas, isSystemTx, data] =
    transactionArray

  if (transactionArray.length !== 8 || !isHex(sourceHash) || !isHex(from))
    throw new InvalidSerializedTransactionError({
      attributes: {
        sourceHash,
        from,
        gas,
        to,
        mint,
        value,
        isSystemTx,
        data,
      },
      serializedTransaction,
      type: 'deposit',
    })

  const transaction: TransactionSerializableDeposit = {
    sourceHash,
    from,
    type: 'deposit',
  }

  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(mint) && mint !== '0x') transaction.mint = hexToBigInt(mint)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(isSystemTx) && isSystemTx !== '0x')
    transaction.isSystemTx = hexToBool(isSystemTx)
  if (isHex(data) && data !== '0x') transaction.data = data

  assertTransactionDeposit(transaction)

  return transaction
}

function parseTransactionPostExec(
  serializedTransaction: TransactionSerializedPostExec,
): ParseTransactionReturnType<TransactionSerializedPostExec> {
  if (size(serializedTransaction) === 1)
    throw new InvalidSerializedTransactionError({
      attributes: { data: undefined },
      serializedTransaction,
      type: 'postExec',
    })

  // The payload follows the type byte as is, with no outer RLP list.
  return { data: sliceHex(serializedTransaction, 1), type: 'postExec' }
}
