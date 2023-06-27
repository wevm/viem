import { InvalidLegacyVError } from '../../errors/transaction.js'
import type { Signature } from '../../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableLegacy,
  TransactionSerialized,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedLegacy,
  TransactionType,
} from '../../types/transaction.js'
import { concatHex } from '../data/concat.js'
import { trim } from '../data/trim.js'
import { toHex } from '../encoding/toHex.js'
import { toRlp } from '../encoding/toRlp.js'

import {
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionLegacy,
} from './assertTransaction.js'
import {
  type GetTransactionType,
  getTransactionType,
} from './getTransactionType.js'
import { serializeAccessList } from './serializeAccessList.js'

export type SerializedTransactionReturnType<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
  TTransactionType extends TransactionType = GetTransactionType<TTransactionSerializable>,
> = TransactionSerialized<TTransactionType>

export type SerializeTransactionFn<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
> = typeof serializeTransaction<TTransactionSerializable>

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
    ) as SerializedTransactionReturnType<TTransactionSerializable>

  if (type === 'eip2930')
    return serializeTransactionEIP2930(
      transaction as TransactionSerializableEIP2930,
      signature,
    ) as SerializedTransactionReturnType<TTransactionSerializable>

  return serializeTransactionLegacy(
    transaction as TransactionSerializableLegacy,
    signature,
  ) as SerializedTransactionReturnType<TTransactionSerializable>
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
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
    serializedAccessList,
  ]

  if (signature)
    serializedTransaction.push(
      signature.v === 27n ? '0x' : toHex(1), // yParity
      trim(signature.r),
      trim(signature.s),
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
    nonce ? toHex(nonce) : '0x',
    gasPrice ? toHex(gasPrice) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
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
    nonce ? toHex(nonce) : '0x',
    gasPrice ? toHex(gasPrice) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
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
