import type {
  TransactionSerializable,
  TransactionSerializableGeneric,
} from '../../types/transaction.js'

import {
  type Address,
  BaseError,
  FeeCapTooHighError,
  InvalidAddressError,
  InvalidChainIdError,
  type SerializeTransactionFn,
  type Signature,
  TipAboveFeeCapError,
  concatHex,
  isAddress,
  serializeAccessList,
  serializeTransaction as viemSerializeTransaction,
  toHex,
  toRlp,
  trim,
} from '../../index.js'

export type TransactionSerializableCIP42 = TransactionSerializableGeneric & {
  feeCurrency?: Address
  gatewayFeeRecipient?: Address
  gatewayFee?: bigint
  chainId: number
  type: 'cip42'
}

export type TransactionSerializableIncludingCIP42 =
  | TransactionSerializableCIP42
  | TransactionSerializable

type SerializedCIP42TransactionReturnType = `0x7c${string}`

export const serializeTransaction: SerializeTransactionFn<TransactionSerializableIncludingCIP42> =
  function (tx, signature?: Signature) {
    // handle celo's feeCurrency Transactions
    if (couldBeCIP42(tx)) {
      return serializeTransactionCIP42(
        tx as TransactionSerializableCIP42,
        signature,
      )
    }
    // handle rest of tx types
    return viemSerializeTransaction(tx as TransactionSerializable, signature)
  }

// There shall be a typed transaction with the code 0x7c that has the following format:
// 0x7c || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, feecurrency, gatewayFeeRecipient, gatewayfee, destination, amount, data, access_list, signature_y_parity, signature_r, signature_s]).
// This will be in addition to the type 0x02 transaction as specified in EIP-1559.
function serializeTransactionCIP42(
  transaction: TransactionSerializableCIP42,
  signature?: Signature,
): SerializedCIP42TransactionReturnType {
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
  ]) as SerializedCIP42TransactionReturnType
}

// process as CIP42 if any of these fields are present realistically gatewayfee is not used but is part of spec
function couldBeCIP42(tx: TransactionSerializableIncludingCIP42) {
  const maybeCIP42 = tx as TransactionSerializableCIP42
  if (
    tx.type === 'cip42' ||
    maybeCIP42.feeCurrency ||
    maybeCIP42.gatewayFee ||
    maybeCIP42.gatewayFeeRecipient
  ) {
    return true
  }
  return false
}

function assertTransactionCIP42(transaction: TransactionSerializableCIP42) {
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
  // TODO  should this throw for any chain id not one of celo's chains or is that to restrictive?
  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (gasPrice)
    throw new BaseError(
      '`gasPrice` is not a valid CIP-42 Transaction attribute.',
    )
  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
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
}
