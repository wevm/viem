import { InvalidAddressError } from '../../errors/address.js'
import { BaseError } from '../../errors/base.js'
import { InvalidChainIdError } from '../../errors/chain.js'
import { FeeCapTooHighError, TipAboveFeeCapError } from '../../errors/node.js'
import type { ChainSerializers } from '../../types/chain.js'
import type { Signature } from '../../types/misc.js'
import type { TransactionSerializable } from '../../types/transaction.js'
import { isAddress } from '../../utils/address/isAddress.js'
import { concatHex } from '../../utils/data/concat.js'
import { trim } from '../../utils/data/trim.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { serializeAccessList } from '../../utils/transaction/serializeAccessList.js'
import {
  type SerializeTransactionFn,
  serializeTransaction,
} from '../../utils/transaction/serializeTransaction.js'
import type {
  CeloTransactionSerializable,
  TransactionSerializableCIP42,
  TransactionSerializableCIP64,
  TransactionSerializedCIP42,
  TransactionSerializedCIP64,
} from './types.js'

export const serializeTransactionCelo: SerializeTransactionFn<
  CeloTransactionSerializable
> = (tx, signature) => {
  if (isCIP64(tx)) {
    return serializeTransactionCIP64(
      tx as TransactionSerializableCIP64,
      signature,
    )
  } else if (isCIP42(tx)) {
    return serializeTransactionCIP42(
      tx as TransactionSerializableCIP42,
      signature,
    )
  } else {
    return serializeTransaction(tx as TransactionSerializable, signature)
  }
}

export const serializersCelo = {
  transaction: serializeTransactionCelo,
} as const satisfies ChainSerializers

//////////////////////////////////////////////////////////////////////////////
// Serializers

export type SerializeTransactionCIP42ReturnType = TransactionSerializedCIP42
export type SerializeTransactionCIP64ReturnType = TransactionSerializedCIP64

// There shall be a typed transaction with the code 0x7c that has the following format:
// 0x7c || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, feecurrency, gatewayFeeRecipient, gatewayfee, destination, amount, data, access_list, signature_y_parity, signature_r, signature_s]).
// This will be in addition to the type 0x02 transaction as specified in EIP-1559.
function serializeTransactionCIP42(
  transaction: TransactionSerializableCIP42,
  signature?: Signature,
): SerializeTransactionCIP42ReturnType {
  assertTransactionCIP42(transaction)
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    feeCurrency,
    gatewayFeeRecipient,
    gatewayFee,
    data,
  } = transaction

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    feeCurrency ?? '0x',
    gatewayFeeRecipient ?? '0x',
    gatewayFee ? toHex(gatewayFee) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
    serializeAccessList(accessList),
  ]

  if (signature) {
    serializedTransaction.push(
      signature.v === 27n ? '0x' : toHex(1), // yParity
      trim(signature.r),
      trim(signature.s),
    )
  }

  return concatHex([
    '0x7c',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionCIP42ReturnType
}

function serializeTransactionCIP64(
  transaction: TransactionSerializableCIP64,
  signature?: Signature,
): SerializeTransactionCIP64ReturnType {
  assertTransactionCIP64(transaction)
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    feeCurrency,
    data,
  } = transaction

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
    serializeAccessList(accessList),
    feeCurrency ?? '0x',
  ]

  if (signature) {
    serializedTransaction.push(
      signature.v === 27n ? '0x' : toHex(1), // yParity
      trim(signature.r),
      trim(signature.s),
    )
  }

  return concatHex([
    '0x7b',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionCIP64ReturnType
}

//////////////////////////////////////////////////////////////////////////////
// Utilities

// process as CIP42 if any of these fields are present. realistically gatewayfee is not used but is part of spec
function isCIP42(transaction: CeloTransactionSerializable): boolean {
  if (transaction.type === 'cip42') return true
  // if the type is defined as anything else, assume it is *not* cip42
  if (transaction.type) return false

  // if the type is undefined, check if the fields match the expectations for cip42
  return (
    'maxFeePerGas' in transaction &&
    'maxPriorityFeePerGas' in transaction &&
    ('feeCurrency' in transaction ||
      'gatewayFee' in transaction ||
      'gatewayFeeRecipient' in transaction)
  )
}

function isCIP64(transaction: CeloTransactionSerializable): boolean {
  if (transaction.type === 'cip64') return true
  // if the type is defined as anything else, assume it is *not* cip64
  if (transaction.type) return false

  // if the type is undefined, check if the fields match the expectations for cip64
  return (
    'maxFeePerGas' in transaction &&
    'maxPriorityFeePerGas' in transaction &&
    'feeCurrency' in transaction &&
    !('gatewayFee' in transaction) &&
    !('gatewayFeeRecipient' in transaction)
  )
}

// maxFeePerGas must be less than 2^256 - 1: however writing like that caused exceptions to be raised
const MAX_MAX_FEE_PER_GAS =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n

export function assertTransactionCIP42(
  transaction: TransactionSerializableCIP42,
) {
  const {
    chainId,
    maxPriorityFeePerGas,
    gasPrice,
    maxFeePerGas,
    to,
    feeCurrency,
    gatewayFee,
    gatewayFeeRecipient,
  } = transaction
  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (gasPrice)
    throw new BaseError(
      '`gasPrice` is not a valid CIP-42 Transaction attribute.',
    )

  if (maxFeePerGas && maxFeePerGas > MAX_MAX_FEE_PER_GAS)
    throw new FeeCapTooHighError({ maxFeePerGas })

  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })

  if (
    (gatewayFee && !gatewayFeeRecipient) ||
    (gatewayFeeRecipient && !gatewayFee)
  ) {
    throw new BaseError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
  }

  if (feeCurrency && !feeCurrency?.startsWith('0x')) {
    throw new BaseError(
      '`feeCurrency` MUST be a token address for CIP-42 transactions.',
    )
  }

  if (!feeCurrency && !gatewayFeeRecipient) {
    throw new BaseError(
      'Either `feeCurrency` or `gatewayFeeRecipient` must be provided for CIP-42 transactions.',
    )
  }
}

export function assertTransactionCIP64(
  transaction: TransactionSerializableCIP64,
) {
  const {
    chainId,
    maxPriorityFeePerGas,
    gasPrice,
    maxFeePerGas,
    to,
    feeCurrency,
  } = transaction

  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })

  if (gasPrice)
    throw new BaseError(
      '`gasPrice` is not a valid CIP-64 Transaction attribute.',
    )

  if (maxFeePerGas && maxFeePerGas > MAX_MAX_FEE_PER_GAS)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })

  if (feeCurrency && !feeCurrency?.startsWith('0x')) {
    throw new BaseError(
      '`feeCurrency` MUST be a token address for CIP-64 transactions.',
    )
  }

  if (!feeCurrency) {
    throw new BaseError(
      '`feeCurrency` must be provided for CIP-64 transactions.',
    )
  }
}
