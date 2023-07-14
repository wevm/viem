import { InvalidSerializedTransactionError } from '../../errors/transaction.js'
import {
  type Hex,
  type TransactionSerialized,
  hexToBigInt,
  hexToNumber,
  isHex,
  parseTransaction as parseTransaction_,
  sliceHex,
} from '../../index.js'
import {
  parseAccessList,
  toTransactionArray,
} from '../../utils/transaction/parseTransaction.js'
import {
  type SerializedCIP42TransactionReturnType,
  type TransactionSerializableCIP42,
  type TransactionSerializableCelo,
  assertTransactionCIP42,
} from '../serializers/celo.js'

import type { RecursiveArray } from '../../utils/encoding/toRlp.js'

export function parseTransaction(
  serializedTransaction:
    | TransactionSerialized
    | SerializedCIP42TransactionReturnType,
): TransactionSerializableCelo {
  const serializedType = sliceHex(serializedTransaction, 0, 1)

  if (serializedType === '0x7c') {
    return parseTransactionCIP42(
      serializedTransaction as SerializedCIP42TransactionReturnType,
    )
  }

  return parseTransaction_(serializedTransaction)
}

function parseTransactionCIP42(
  serializedTransaction: SerializedCIP42TransactionReturnType,
): TransactionSerializableCIP42 {
  const transactionArray = toTransactionArray(serializedTransaction)

  const [
    chainId,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    feeCurrency,
    gatewayFeeRecipient,
    gatewayFee,
    to,
    value,
    data,
    accessList,
    v,
    r,
    s,
  ] = transactionArray

  if (transactionArray.length !== 15 && transactionArray.length !== 12) {
    throw new InvalidSerializedTransactionError({
      attributes: {
        chainId,
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gas,
        feeCurrency,
        to,
        gatewayFeeRecipient,
        gatewayFee,
        value,
        data,
        accessList,
        ...(transactionArray.length > 12
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'cip42',
    })
  }

  const transaction: Partial<TransactionSerializableCIP42> = {
    chainId: hexToNumber(chainId as Hex),
    type: 'cip42',
  }

  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(feeCurrency) && feeCurrency !== '0x')
    transaction.feeCurrency = feeCurrency
  if (isHex(gatewayFeeRecipient) && gatewayFeeRecipient !== '0x')
    transaction.gatewayFeeRecipient = gatewayFeeRecipient
  if (isHex(gatewayFee) && gatewayFee !== '0x')
    transaction.gatewayFee = hexToBigInt(gatewayFee)
  if (isHex(maxFeePerGas) && maxFeePerGas !== '0x')
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== '0x')
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== '0x')
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)

  assertTransactionCIP42(transaction as TransactionSerializableCIP42)

  return transaction as TransactionSerializableCIP42
}

