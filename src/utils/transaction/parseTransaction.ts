import {
  InvalidAddressError,
  type InvalidAddressErrorType,
} from '../../errors/address.js'
import {
  InvalidLegacyVError,
  type InvalidLegacyVErrorType,
  InvalidSerializedTransactionError,
  type InvalidSerializedTransactionErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  SerializedAuthorizationList,
  SignedAuthorizationList,
} from '../../types/authorization.js'
import type { Hex, Signature } from '../../types/misc.js'
import type {
  AccessList,
  TransactionRequestEIP2930,
  TransactionRequestLegacy,
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableEIP7702,
  TransactionSerializableLegacy,
  TransactionSerialized,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedEIP4844,
  TransactionSerializedEIP7702,
  TransactionSerializedGeneric,
  TransactionType,
} from '../../types/transaction.js'
import type { IsNarrowable, Mutable } from '../../types/utils.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { toBlobSidecars } from '../blob/toBlobSidecars.js'
import { type IsHexErrorType, isHex } from '../data/isHex.js'
import { type PadHexErrorType, padHex } from '../data/pad.js'
import { trim } from '../data/trim.js'
import {
  type HexToBigIntErrorType,
  type HexToNumberErrorType,
  hexToBigInt,
  hexToNumber,
} from '../encoding/fromHex.js'
import { type FromRlpErrorType, fromRlp } from '../encoding/fromRlp.js'
import type { RecursiveArray } from '../encoding/toRlp.js'
import { isHash } from '../hash/isHash.js'

import {
  type AssertTransactionEIP1559ErrorType,
  type AssertTransactionEIP2930ErrorType,
  type AssertTransactionEIP4844ErrorType,
  type AssertTransactionEIP7702ErrorType,
  type AssertTransactionLegacyErrorType,
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionEIP4844,
  assertTransactionEIP7702,
  assertTransactionLegacy,
} from './assertTransaction.js'
import {
  type GetSerializedTransactionType,
  type GetSerializedTransactionTypeErrorType,
  getSerializedTransactionType,
} from './getSerializedTransactionType.js'

export type ParseTransactionReturnType<
  serialized extends TransactionSerializedGeneric = TransactionSerialized,
  type extends TransactionType = GetSerializedTransactionType<serialized>,
> = IsNarrowable<serialized, Hex> extends true
  ?
      | (type extends 'eip1559' ? TransactionSerializableEIP1559 : never)
      | (type extends 'eip2930' ? TransactionSerializableEIP2930 : never)
      | (type extends 'eip4844' ? TransactionSerializableEIP4844 : never)
      | (type extends 'eip7702' ? TransactionSerializableEIP7702 : never)
      | (type extends 'legacy' ? TransactionSerializableLegacy : never)
  : TransactionSerializable

export type ParseTransactionErrorType =
  | GetSerializedTransactionTypeErrorType
  | ParseTransactionEIP1559ErrorType
  | ParseTransactionEIP2930ErrorType
  | ParseTransactionEIP4844ErrorType
  | ParseTransactionEIP7702ErrorType
  | ParseTransactionLegacyErrorType

export function parseTransaction<
  const serialized extends TransactionSerializedGeneric,
>(serializedTransaction: serialized): ParseTransactionReturnType<serialized> {
  const type = getSerializedTransactionType(serializedTransaction)

  if (type === 'eip1559')
    return parseTransactionEIP1559(
      serializedTransaction as TransactionSerializedEIP1559,
    ) as ParseTransactionReturnType<serialized>

  if (type === 'eip2930')
    return parseTransactionEIP2930(
      serializedTransaction as TransactionSerializedEIP2930,
    ) as ParseTransactionReturnType<serialized>

  if (type === 'eip4844')
    return parseTransactionEIP4844(
      serializedTransaction as TransactionSerializedEIP4844,
    ) as ParseTransactionReturnType<serialized>

  if (type === 'eip7702')
    return parseTransactionEIP7702(
      serializedTransaction as TransactionSerializedEIP7702,
    ) as ParseTransactionReturnType<serialized>

  return parseTransactionLegacy(
    serializedTransaction,
  ) as ParseTransactionReturnType<serialized>
}

type ParseTransactionEIP7702ErrorType =
  | ToTransactionArrayErrorType
  | AssertTransactionEIP7702ErrorType
  | ToTransactionArrayErrorType
  | HexToBigIntErrorType
  | HexToNumberErrorType
  | InvalidLegacyVErrorType
  | InvalidSerializedTransactionErrorType
  | IsHexErrorType
  | ParseAuthorizationListErrorType
  | ParseEIP155SignatureErrorType
  | ErrorType

function parseTransactionEIP7702(
  serializedTransaction: TransactionSerializedEIP7702,
): TransactionSerializableEIP7702 {
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
    authorizationList,
    v,
    r,
    s,
  ] = transactionArray

  if (transactionArray.length !== 10 && transactionArray.length !== 13)
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
        authorizationList,
        ...(transactionArray.length > 9
          ? {
              v,
              r,
              s,
            }
          : {}),
      },
      serializedTransaction,
      type: 'eip7702',
    })

  const transaction = {
    chainId: hexToNumber(chainId as Hex),
    type: 'eip7702',
  } as TransactionSerializableEIP7702
  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce)) transaction.nonce = nonce === '0x' ? 0 : hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(maxFeePerGas) && maxFeePerGas !== '0x')
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== '0x')
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== '0x')
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)
  if (authorizationList.length !== 0 && authorizationList !== '0x')
    transaction.authorizationList = parseAuthorizationList(
      authorizationList as SerializedAuthorizationList,
    )

  assertTransactionEIP7702(transaction)

  const signature =
    transactionArray.length === 13
      ? parseEIP155Signature(transactionArray as RecursiveArray<Hex>)
      : undefined

  return { ...signature, ...transaction }
}

type ParseTransactionEIP4844ErrorType =
  | ToTransactionArrayErrorType
  | AssertTransactionEIP4844ErrorType
  | ToTransactionArrayErrorType
  | HexToBigIntErrorType
  | HexToNumberErrorType
  | InvalidLegacyVErrorType
  | InvalidSerializedTransactionErrorType
  | IsHexErrorType
  | ParseEIP155SignatureErrorType
  | ErrorType

function parseTransactionEIP4844(
  serializedTransaction: TransactionSerializedEIP4844,
): TransactionSerializableEIP4844 {
  const transactionOrWrapperArray = toTransactionArray(serializedTransaction)

  const hasNetworkWrapper = transactionOrWrapperArray.length === 4

  const transactionArray = hasNetworkWrapper
    ? transactionOrWrapperArray[0]
    : transactionOrWrapperArray
  const wrapperArray = hasNetworkWrapper
    ? transactionOrWrapperArray.slice(1)
    : []

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
    maxFeePerBlobGas,
    blobVersionedHashes,
    v,
    r,
    s,
  ] = transactionArray
  const [blobs, commitments, proofs] = wrapperArray

  if (!(transactionArray.length === 11 || transactionArray.length === 14))
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
      type: 'eip4844',
    })

  const transaction = {
    blobVersionedHashes: blobVersionedHashes as Hex[],
    chainId: hexToNumber(chainId as Hex),
    type: 'eip4844',
  } as TransactionSerializableEIP4844
  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce)) transaction.nonce = nonce === '0x' ? 0 : hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(maxFeePerBlobGas) && maxFeePerBlobGas !== '0x')
    transaction.maxFeePerBlobGas = hexToBigInt(maxFeePerBlobGas)
  if (isHex(maxFeePerGas) && maxFeePerGas !== '0x')
    transaction.maxFeePerGas = hexToBigInt(maxFeePerGas)
  if (isHex(maxPriorityFeePerGas) && maxPriorityFeePerGas !== '0x')
    transaction.maxPriorityFeePerGas = hexToBigInt(maxPriorityFeePerGas)
  if (accessList.length !== 0 && accessList !== '0x')
    transaction.accessList = parseAccessList(accessList as RecursiveArray<Hex>)
  if (blobs && commitments && proofs)
    transaction.sidecars = toBlobSidecars({
      blobs: blobs as Hex[],
      commitments: commitments as Hex[],
      proofs: proofs as Hex[],
    })

  assertTransactionEIP4844(transaction)

  const signature =
    transactionArray.length === 14
      ? parseEIP155Signature(transactionArray as RecursiveArray<Hex>)
      : undefined

  return { ...signature, ...transaction }
}

type ParseTransactionEIP1559ErrorType =
  | ToTransactionArrayErrorType
  | AssertTransactionEIP1559ErrorType
  | ToTransactionArrayErrorType
  | HexToBigIntErrorType
  | HexToNumberErrorType
  | InvalidLegacyVErrorType
  | InvalidSerializedTransactionErrorType
  | IsHexErrorType
  | ParseEIP155SignatureErrorType
  | ParseAccessListErrorType
  | ErrorType

function parseTransactionEIP1559(
  serializedTransaction: TransactionSerializedEIP1559,
): TransactionSerializableEIP1559 {
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
  if (isHex(nonce)) transaction.nonce = nonce === '0x' ? 0 : hexToNumber(nonce)
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

type ParseTransactionEIP2930ErrorType =
  | ToTransactionArrayErrorType
  | AssertTransactionEIP2930ErrorType
  | ToTransactionArrayErrorType
  | HexToBigIntErrorType
  | HexToNumberErrorType
  | InvalidLegacyVErrorType
  | InvalidSerializedTransactionErrorType
  | IsHexErrorType
  | ParseEIP155SignatureErrorType
  | ParseAccessListErrorType
  | ErrorType

function parseTransactionEIP2930(
  serializedTransaction: TransactionSerializedEIP2930,
): Omit<TransactionRequestEIP2930, 'from'> &
  ({ chainId: number } | ({ chainId: number } & Signature)) {
  const transactionArray = toTransactionArray(serializedTransaction)

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
  if (isHex(nonce)) transaction.nonce = nonce === '0x' ? 0 : hexToNumber(nonce)
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

type ParseTransactionLegacyErrorType =
  | AssertTransactionLegacyErrorType
  | FromRlpErrorType
  | HexToBigIntErrorType
  | HexToNumberErrorType
  | InvalidLegacyVErrorType
  | InvalidSerializedTransactionErrorType
  | IsHexErrorType
  | ErrorType

function parseTransactionLegacy(
  serializedTransaction: Hex,
): Omit<TransactionRequestLegacy, 'from'> &
  ({ chainId?: number | undefined } | ({ chainId: number } & Signature)) {
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
  if (isHex(nonce)) transaction.nonce = nonce === '0x' ? 0 : hexToNumber(nonce)
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
  transaction.yParity = v % 2n === 0n ? 1 : 0

  return transaction
}

type ToTransactionArrayErrorType = FromRlpErrorType | ErrorType

export function toTransactionArray(serializedTransaction: string) {
  return fromRlp(`0x${serializedTransaction.slice(4)}` as Hex, 'hex')
}

type ParseAccessListErrorType =
  | InvalidAddressErrorType
  | IsAddressErrorType
  | ErrorType

export function parseAccessList(accessList_: RecursiveArray<Hex>): AccessList {
  const accessList: Mutable<AccessList> = []
  for (let i = 0; i < accessList_.length; i++) {
    const [address, storageKeys] = accessList_[i] as [Hex, Hex[]]

    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address })

    accessList.push({
      address: address,
      storageKeys: storageKeys.map((key) => (isHash(key) ? key : trim(key))),
    })
  }
  return accessList
}

type ParseAuthorizationListErrorType =
  | HexToNumberErrorType
  | ParseEIP155SignatureErrorType
  | ErrorType

function parseAuthorizationList(
  serializedAuthorizationList: SerializedAuthorizationList,
): SignedAuthorizationList {
  const authorizationList: Mutable<SignedAuthorizationList> = []
  for (let i = 0; i < serializedAuthorizationList.length; i++) {
    const [chainId, address, nonce, yParity, r, s] =
      serializedAuthorizationList[i]

    authorizationList.push({
      address,
      chainId: chainId === '0x' ? 0 : hexToNumber(chainId),
      nonce: nonce === '0x' ? 0 : hexToNumber(nonce),
      ...parseEIP155Signature([yParity, r, s]),
    })
  }
  return authorizationList
}

type ParseEIP155SignatureErrorType =
  | HexToBigIntErrorType
  | PadHexErrorType
  | ErrorType

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
