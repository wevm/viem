import { InvalidAddressError } from '../../errors/address.js'
import { BaseError } from '../../errors/base.js'
import { InvalidChainIdError } from '../../errors/chain.js'
import { FeeCapTooHighError, TipAboveFeeCapError } from '../../errors/node.js'
import type { ChainSerializers } from '../../types/chain.js'
import type { Signature } from '../../types/misc.js'
import { isAddress } from '../../utils/address/isAddress.js'
import { concatHex } from '../../utils/data/concat.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { serializeAccessList } from '../../utils/transaction/serializeAccessList.js'
import {
  serializeTransaction as serializeTransaction_,
  toYParitySignatureArray,
} from '../../utils/transaction/serializeTransaction.js'
import type {
  CeloTransactionSerializable,
  TransactionSerializableCIP42,
  TransactionSerializableCIP64,
  TransactionSerializedCIP42,
  TransactionSerializedCIP64,
} from './types.js'
import { isCIP42, isCIP64, isEmpty, isPresent } from './utils.js'

export function serializeTransaction(
  transaction: CeloTransactionSerializable,
  signature?: Signature,
) {
  if (isCIP64(transaction))
    return serializeTransactionCIP64(transaction, signature)
  if (isCIP42(transaction))
    return serializeTransactionCIP42(transaction, signature)
  return serializeTransaction_(transaction, signature)
}

export const serializers = {
  transaction: serializeTransaction,
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
    ...toYParitySignatureArray(transaction, signature),
  ]

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
    feeCurrency!,
    ...toYParitySignatureArray(transaction, signature),
  ]

  return concatHex([
    '0x7b',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionCIP64ReturnType
}

// maxFeePerGas must be less than 2^256 - 1
const MAX_MAX_FEE_PER_GAS = 2n ** 256n - 1n

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

  if (isPresent(maxFeePerGas) && maxFeePerGas > MAX_MAX_FEE_PER_GAS)
    throw new FeeCapTooHighError({ maxFeePerGas })

  if (
    isPresent(maxPriorityFeePerGas) &&
    isPresent(maxFeePerGas) &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })

  if (
    (isPresent(gatewayFee) && isEmpty(gatewayFeeRecipient)) ||
    (isPresent(gatewayFeeRecipient) && isEmpty(gatewayFee))
  ) {
    throw new BaseError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
  }

  if (isPresent(feeCurrency) && !isAddress(feeCurrency)) {
    throw new BaseError(
      '`feeCurrency` MUST be a token address for CIP-42 transactions.',
    )
  }

  if (isPresent(gatewayFeeRecipient) && !isAddress(gatewayFeeRecipient)) {
    throw new InvalidAddressError(gatewayFeeRecipient)
  }

  if (isEmpty(feeCurrency) && isEmpty(gatewayFeeRecipient)) {
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

  if (isPresent(maxFeePerGas) && maxFeePerGas > MAX_MAX_FEE_PER_GAS)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    isPresent(maxPriorityFeePerGas) &&
    isPresent(maxFeePerGas) &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })

  if (isPresent(feeCurrency) && !isAddress(feeCurrency)) {
    throw new BaseError(
      '`feeCurrency` MUST be a token address for CIP-64 transactions.',
    )
  }

  if (isEmpty(feeCurrency)) {
    throw new BaseError(
      '`feeCurrency` must be provided for CIP-64 transactions.',
    )
  }
}
