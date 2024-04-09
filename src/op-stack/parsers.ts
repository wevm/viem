import { InvalidSerializedTransactionError } from '../errors/transaction.js'
import type { ErrorType } from '../errors/utils.js'
import { isHex } from '../utils/data/isHex.js'
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
  TransactionSerializedDeposit,
} from './types/transaction.js'

export type ParseTransactionReturnType<
  TSerialized extends
    OpStackTransactionSerialized = OpStackTransactionSerialized,
  TType extends
    OpStackTransactionType = GetSerializedTransactionType<TSerialized>,
> = TSerialized extends TransactionSerializedDeposit
  ? TransactionSerializableDeposit
  : ParseTransactionReturnType_<TSerialized, TType>

export type ParseTransactionErrorType = ParseTransactionErrorType_ | ErrorType

export function parseTransaction<
  TSerialized extends OpStackTransactionSerialized,
>(serializedTransaction: TSerialized): ParseTransactionReturnType<TSerialized> {
  const serializedType = sliceHex(serializedTransaction, 0, 1)

  if (serializedType === '0x7e')
    return parseTransactionDeposit(
      serializedTransaction as TransactionSerializedDeposit,
    ) as ParseTransactionReturnType<TSerialized>

  return parseTransaction_(
    serializedTransaction,
  ) as ParseTransactionReturnType<TSerialized>
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
