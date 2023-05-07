import { InvalidAddressError } from '../../errors/address.js'
import {
  InvalidLegacyVError,
  InvalidSerializedTransactionError,
} from '../../errors/transaction.js'
import type { Hex, Signature } from '../../types/misc.js'
import type {
  AccessList,
  TransactionRequestEIP2930,
  TransactionRequestLegacy,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableLegacy,
  TransactionSerialized,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionType,
} from '../../types/transaction.js'
import { isAddress } from '../address/isAddress.js'
import { isHex } from '../data/isHex.js'
import { padHex } from '../data/pad.js'
import { trim } from '../data/trim.js'
import { hexToBigInt, hexToNumber } from '../encoding/fromHex.js'
import { fromRlp } from '../encoding/fromRlp.js'
import type { RecursiveArray } from '../encoding/toRlp.js'
import { isHash } from '../hash/isHash.js'

import {
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionLegacy,
} from './assertTransaction.js'
import {
  type GetSerializedTransactionType,
  getSerializedTransactionType,
} from './getSerializedTransactionType.js'

export type ParseTransactionReturnType<
  TSerialized extends TransactionSerialized = TransactionSerialized,
  TType extends TransactionType = GetSerializedTransactionType<TSerialized>,
> =
  | (TType extends 'eip1559' ? TransactionSerializableEIP1559 : never)
  | (TType extends 'eip2930' ? TransactionSerializableEIP2930 : never)
  | (TType extends 'legacy' ? TransactionSerializableLegacy : never)

export function parseTransaction<TSerialized extends TransactionSerialized>(
  serializedTransaction: TSerialized,
): ParseTransactionReturnType<TSerialized> {
  const type = getSerializedTransactionType(serializedTransaction)

  if (type === 'eip1559')
    return parseTransactionEIP1559(
      serializedTransaction as TransactionSerializedEIP1559,
    ) as ParseTransactionReturnType<TSerialized>

  if (type === 'eip2930')
    return parseTransactionEIP2930(
      serializedTransaction as TransactionSerializedEIP2930,
    ) as ParseTransactionReturnType<TSerialized>

  return parseTransactionLegacy(
    serializedTransaction,
  ) as ParseTransactionReturnType<TSerialized>
}

function parseTransactionEIP1559(
  serializedTransaction: TransactionSerializedEIP1559,
): TransactionSerializableEIP1559 {
  const transactionArray = fromRlp(
    `0x${serializedTransaction.slice(4)}` as Hex,
    'hex',
  )

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
    v,
    r,
    s,
  ] = transactionArray

  if (!(transactionArray.length === 9 || transactionArray.length === 12))
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
        ...(transactionArray.length > 9
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'eip1559',
    })

  const transaction: TransactionSerializableEIP1559 = {
    chainId: hexToNumber(chainId as Hex),
    type: 'eip1559',
  }
  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(maxFeePerGas) && maxFeePerGas !== '0x')
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== '0x')
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== '0x')
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)

  assertTransactionEIP1559(transaction)

  const signature =
    transactionArray.length === 12
      ? parseEIP155Signature(transactionArray)
      : undefined

  return { ...signature, ...transaction }
}

function parseTransactionEIP2930(
  serializedTransaction: TransactionSerializedEIP2930,
): Omit<TransactionRequestEIP2930, 'from'> &
  ({ chainId: number } | ({ chainId: number } & Signature)) {
  const transactionArray = fromRlp(
    `0x${serializedTransaction.slice(4)}` as Hex,
    'hex',
  )

  const [chainId, nonce, gasPrice, gas, to, value, data, accessList, v, r, s] =
    transactionArray

  if (!(transactionArray.length === 8 || transactionArray.length === 11))
    throw new InvalidSerializedTransactionError({
      attributes: {
        chainId,
        nonce,
        gasPrice,
        gas,
        to,
        value,
        data,
        accessList,
        ...(transactionArray.length > 8
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'eip2930',
    })

  const transaction: TransactionSerializableEIP2930 = {
    chainId: hexToNumber(chainId as Hex),
    type: 'eip2930',
  }
  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(gasPrice) && gasPrice !== '0x')
    transaction.gasPrice = hexToBigInt(gasPrice)
  if (accessList.length !== 0 && accessList !== '0x')
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)

  assertTransactionEIP2930(transaction)

  const signature =
    transactionArray.length === 11
      ? parseEIP155Signature(transactionArray)
      : undefined

  return { ...signature, ...transaction }
}

function parseTransactionLegacy(
  serializedTransaction: Hex,
): Omit<TransactionRequestLegacy, 'from'> &
  ({ chainId?: number } | ({ chainId: number } & Signature)) {
  const transactionArray = fromRlp(serializedTransaction, 'hex')

  const [nonce, gasPrice, gas, to, value, data, chainIdOrV_, r, s] =
    transactionArray

  if (!(transactionArray.length === 6 || transactionArray.length === 9))
    throw new InvalidSerializedTransactionError({
      attributes: {
        nonce,
        gasPrice,
        gas,
        to,
        value,
        data,
        ...(transactionArray.length > 6
          ? {
              v: chainIdOrV_,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'legacy',
    })

  const transaction: TransactionSerializableLegacy = {
    type: 'legacy',
  }
  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(gasPrice) && gasPrice !== '0x')
    transaction.gasPrice = hexToBigInt(gasPrice)

  assertTransactionLegacy(transaction)

  if (transactionArray.length === 6) return transaction

  const chainIdOrV =
    isHex(chainIdOrV_) && chainIdOrV_ !== '0x'
      ? hexToBigInt(chainIdOrV_ as Hex)
      : 0n

  if (s === '0x' && r === '0x') {
    if (chainIdOrV > 0) transaction.chainId = Number(chainIdOrV)
    return transaction
  }

  const v = chainIdOrV

  const chainId: number | undefined = Number((v - 35n) / 2n)
  if (chainId > 0) transaction.chainId = chainId
  else if (v !== 27n && v !== 28n) throw new InvalidLegacyVError({ v })

  transaction.v = v
  transaction.s = s as Hex
  transaction.r = r as Hex

  return transaction
}

function parseAccessList(accessList_: RecursiveArray<Hex>): AccessList {
  const accessList: AccessList = []
  for (let i = 0; i < accessList_.length; i++) {
    const [address, storageKeys] = accessList_[i] as [Hex, Hex[]]

    if (!isAddress(address)) throw new InvalidAddressError({ address })

    accessList.push({
      address: address,
      storageKeys: storageKeys.map((key) => (isHash(key) ? key : trim(key))),
    })
  }
  return accessList
}

function parseEIP155Signature(
  transactionArray: RecursiveArray<Hex>,
): Signature & { yParity: number } {
  const signature = transactionArray.slice(-3)
  const v =
    signature[0] === '0x' || hexToBigInt(signature[0] as Hex) === 0n ? 27n : 28n
  return {
    r: padHex(signature[1] as Hex, { size: 32 }),
    s: padHex(signature[2] as Hex, { size: 32 }),
    v,
    yParity: v === 27n ? 0 : 1,
  }
}
