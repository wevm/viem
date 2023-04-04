import {
  InvalidAddressError,
  InvalidLegacyVError,
  InvalidStorageKeySizeError,
} from '../../errors'
import type {
  AccessList,
  Hex,
  Signature,
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableLegacy,
  TransactionSerialized,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedLegacy,
  TransactionType,
} from '../../types'
import { isAddress } from '../address'
import { concatHex } from '../data'
import { toHex, toRlp } from '../encoding'
import type { RecursiveArray } from '../encoding/toRlp'
import {
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionLegacy,
} from './assertTransaction'
import { getTransactionType, GetTransactionType } from './getTransactionType'

export type SerializedTransactionReturnType<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
  TTransactionType extends TransactionType = GetTransactionType<TTransactionSerializable>,
> = TransactionSerialized<TTransactionType>

export function serializeTransaction<
  TTransactionSerializable extends TransactionSerializable,
>(
  transaction: TTransactionSerializable,
  signature?: Signature,
): SerializedTransactionReturnType<TTransactionSerializable> {
  const type = getTransactionType(transaction) as GetTransactionType

  if (type === 'eip1559')
    return serializeTransactionEIP1559(
      transaction as TransactionSerializableEIP1559,
      signature,
    ) as SerializedTransactionReturnType

  if (type === 'eip2930')
    return serializeTransactionEIP2930(
      transaction as TransactionSerializableEIP2930,
      signature,
    ) as SerializedTransactionReturnType

  return serializeTransactionLegacy(
    transaction as TransactionSerializableLegacy,
    signature,
  ) as SerializedTransactionReturnType
}

function serializeTransactionEIP1559(
  transaction: TransactionSerializableEIP1559,
  signature?: Signature,
): TransactionSerializedEIP1559 {
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    data,
  } = transaction

  assertTransactionEIP1559(transaction)

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    toHex(chainId),
    typeof nonce !== 'undefined' ? toHex(nonce) : '0x',
    typeof maxPriorityFeePerGas !== 'undefined'
      ? toHex(maxPriorityFeePerGas)
      : '0x',
    typeof maxFeePerGas !== 'undefined' ? toHex(maxFeePerGas) : '0x',
    typeof gas !== 'undefined' ? toHex(gas) : '0x',
    to ?? '0x',
    typeof value !== 'undefined' ? toHex(value) : '0x',
    data ?? '0x',
    serializedAccessList,
  ]

  if (signature)
    serializedTransaction.push(
      signature.v === 27n ? '0x' : toHex(1), // yParity
      signature.r,
      signature.s,
    )

  return concatHex([
    '0x02',
    toRlp(serializedTransaction),
  ]) as TransactionSerializedEIP1559
}

function serializeTransactionEIP2930(
  transaction: TransactionSerializableEIP2930,
  signature?: Signature,
): TransactionSerializedEIP2930 {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } =
    transaction

  assertTransactionEIP2930(transaction)

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    toHex(chainId),
    typeof nonce !== 'undefined' ? toHex(nonce) : '0x',
    typeof gasPrice !== 'undefined' ? toHex(gasPrice) : '0x',
    typeof gas !== 'undefined' ? toHex(gas) : '0x',
    to ?? '0x',
    typeof value !== 'undefined' ? toHex(value) : '0x',
    data ?? '0x',
    serializedAccessList,
  ]

  if (signature)
    serializedTransaction.push(
      signature.v === 27n ? '0x' : toHex(1), // yParity
      signature.r,
      signature.s,
    )

  return concatHex([
    '0x01',
    toRlp(serializedTransaction),
  ]) as TransactionSerializedEIP2930
}

function serializeTransactionLegacy(
  transaction: TransactionSerializableLegacy,
  signature?: Signature,
): TransactionSerializedLegacy {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction

  assertTransactionLegacy(transaction)

  let serializedTransaction = [
    typeof nonce !== 'undefined' ? toHex(nonce) : '0x',
    typeof gasPrice !== 'undefined' ? toHex(gasPrice) : '0x',
    typeof gas !== 'undefined' ? toHex(gas) : '0x',
    to ?? '0x',
    typeof value !== 'undefined' ? toHex(value) : '0x',
    data ?? '0x',
  ]

  if (signature) {
    let v = 27n + (signature.v === 27n ? 0n : 1n)
    if (chainId > 0) v = BigInt(chainId * 2) + BigInt(35n + signature.v - 27n)
    else if (signature.v !== v)
      throw new InvalidLegacyVError({ v: signature.v })

    serializedTransaction = [
      ...serializedTransaction,
      toHex(v),
      signature.r,
      signature.s,
    ]
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      toHex(chainId),
      '0x',
      '0x',
    ]
  }

  return toRlp(serializedTransaction)
}

function serializeAccessList(accessList?: AccessList): RecursiveArray<Hex> {
  if (!accessList || accessList.length === 0) return []

  let serializedAccessList: RecursiveArray<Hex> = []
  for (let i = 0; i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i]

    for (let j = 0; j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] })
      }
    }

    if (!isAddress(address)) {
      throw new InvalidAddressError({ address })
    }

    serializedAccessList.push([address, storageKeys])
  }
  return serializedAccessList
}
