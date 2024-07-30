import type { OpStackTransactionSerialized } from '../chains/index.js'
import { InvalidSerializedTransactionError } from '../errors/transaction.js'
import type { Hex } from '../types/misc.js'
import type { ExactPartial } from '../types/utils.js'
import { isHex } from '../utils/data/isHex.js'
import { sliceHex } from '../utils/data/slice.js'
import { hexToBigInt, hexToNumber } from '../utils/encoding/fromHex.js'
import type { RecursiveArray } from '../utils/encoding/toRlp.js'
import type { GetSerializedTransactionType } from '../utils/transaction/getSerializedTransactionType.js'
import {
  type ParseTransactionReturnType as ParseTransactionReturnType_,
  parseAccessList,
  toTransactionArray,
} from '../utils/transaction/parseTransaction.js'
import {
  assertTransactionCIP42,
  assertTransactionCIP64,
} from './serializers.js'
import type {
  CeloTransactionSerialized,
  CeloTransactionType,
  TransactionSerializableCIP42,
  TransactionSerializableCIP64,
  TransactionSerializedCIP42,
  TransactionSerializedCIP64,
} from './types.js'

import { parseTransaction as parseTransaction_op } from '../op-stack/parsers.js'

export type ParseTransactionReturnType<
  serialized extends CeloTransactionSerialized = CeloTransactionSerialized,
  type extends CeloTransactionType = GetSerializedTransactionType<serialized>,
> = serialized extends TransactionSerializedCIP42
  ? TransactionSerializableCIP42
  : ParseTransactionReturnType_<serialized, type>

export function parseTransaction<serialized extends CeloTransactionSerialized>(
  serializedTransaction: serialized,
): ParseTransactionReturnType<serialized> {
  const serializedType = sliceHex(serializedTransaction, 0, 1)

  if (serializedType === '0x7c')
    return parseTransactionCIP42(
      serializedTransaction as TransactionSerializedCIP42,
    ) as ParseTransactionReturnType<serialized>

  if (serializedType === '0x7b')
    return parseTransactionCIP64(
      serializedTransaction as TransactionSerializedCIP64,
    ) as ParseTransactionReturnType<serialized>

  return parseTransaction_op(
    serializedTransaction as OpStackTransactionSerialized,
  ) as ParseTransactionReturnType<serialized>
}

function parseTransactionCIP42(
  serializedTransaction: TransactionSerializedCIP42,
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

  const transaction: ExactPartial<TransactionSerializableCIP42> = {
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

function parseTransactionCIP64(
  serializedTransaction: TransactionSerializedCIP64,
): TransactionSerializableCIP64 {
  const transactionArray = toTransactionArray(serializedTransaction)

  const [
    chainId,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    to,
    value,
    data,
    accessList,
    feeCurrency,
    v,
    r,
    s,
  ] = transactionArray

  if (transactionArray.length !== 13 && transactionArray.length !== 10) {
    throw new InvalidSerializedTransactionError({
      attributes: {
        chainId,
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gas,
        to,
        value,
        data,
        accessList,
        feeCurrency,
        ...(transactionArray.length > 10
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'cip64',
    })
  }

  const transaction: ExactPartial<TransactionSerializableCIP64> = {
    chainId: hexToNumber(chainId as Hex),
    type: 'cip64',
  }

  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(feeCurrency) && feeCurrency !== '0x')
    transaction.feeCurrency = feeCurrency
  if (isHex(maxFeePerGas) && maxFeePerGas !== '0x')
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== '0x')
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== '0x')
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)

  assertTransactionCIP64(transaction as TransactionSerializableCIP64)

  return transaction as TransactionSerializableCIP64
}
