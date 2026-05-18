import type { Account } from '../accounts/types.js'
import type { SendTransactionParameters } from '../actions/wallet/sendTransaction.js'
import type { BlockTag } from '../types/block.js'
import type { Chain } from '../types/chain.js'
import type { Hash, Hex } from '../types/misc.js'
import type {
  TransactionReceipt,
  TransactionType,
} from '../types/transaction.js'
import { formatEther } from '../utils/unit/formatEther.js'
import { formatGwei } from '../utils/unit/formatGwei.js'

import { BaseError } from './base.js'

export function prettyPrint(
  args: Record<string, bigint | number | string | undefined | false | unknown>,
) {
  const entries = Object.entries(args)
    .map(([key, value]) => {
      if (value === undefined || value === false) return null
      return [key, value]
    })
    .filter(Boolean) as [string, string][]
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0)
  return entries
    .map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`)
    .join('\n')
}

export type FeeConflictErrorType = FeeConflictError & {
  name: 'FeeConflictError'
}
export class FeeConflictError extends BaseError {
  constructor() {
    super(
      [
        'Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.',
        'Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others.',
      ].join('\n'),
      { name: 'FeeConflictError' },
    )
  }
}

export type InvalidLegacyVErrorType = InvalidLegacyVError & {
  name: 'InvalidLegacyVError'
}
export class InvalidLegacyVError extends BaseError {
  constructor({ v }: { v: bigint }) {
    super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, {
      name: 'InvalidLegacyVError',
    })
  }
}

export type InvalidSerializableTransactionErrorType =
  InvalidSerializableTransactionError & {
    name: 'InvalidSerializableTransactionError'
  }
export class InvalidSerializableTransactionError extends BaseError {
  constructor({ transaction }: { transaction: Record<string, unknown> }) {
    super('Cannot infer a transaction type from provided transaction.', {
      metaMessages: [
        'Provided Transaction:',
        '{',
        prettyPrint(transaction),
        '}',
        '',
        'To infer the type, either provide:',
        '- a `type` to the Transaction, or',
        '- an EIP-1559 Transaction with `maxFeePerGas`, or',
        '- an EIP-2930 Transaction with `gasPrice` & `accessList`, or',
        '- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or',
        '- an EIP-7702 Transaction with `authorizationList`, or',
        '- a Legacy Transaction with `gasPrice`',
      ],
      name: 'InvalidSerializableTransactionError',
    })
  }
}

export type InvalidSerializedTransactionTypeErrorType =
  InvalidSerializedTransactionTypeError & {
    name: 'InvalidSerializedTransactionTypeError'
  }
export class InvalidSerializedTransactionTypeError extends BaseError {
  serializedType: Hex

  constructor({ serializedType }: { serializedType: Hex }) {
    super(`Serialized transaction type "${serializedType}" is invalid.`, {
      name: 'InvalidSerializedTransactionType',
    })

    this.serializedType = serializedType
  }
}

export type InvalidSerializedTransactionErrorType =
  InvalidSerializedTransactionError & {
    name: 'InvalidSerializedTransactionError'
  }
export class InvalidSerializedTransactionError extends BaseError {
  serializedTransaction: Hex
  type: TransactionType

  constructor({
    attributes,
    serializedTransaction,
    type,
  }: {
    attributes: Record<string, unknown>
    serializedTransaction: Hex
    type: TransactionType
  }) {
    const missing = Object.entries(attributes)
      .map(([key, value]) => (typeof value === 'undefined' ? key : undefined))
      .filter(Boolean)
    super(`Invalid serialized transaction of type "${type}" was provided.`, {
      metaMessages: [
        `Serialized Transaction: "${serializedTransaction}"`,
        missing.length > 0 ? `Missing Attributes: ${missing.join(', ')}` : '',
      ].filter(Boolean),
      name: 'InvalidSerializedTransactionError',
    })

    this.serializedTransaction = serializedTransaction
    this.type = type
  }
}

export type InvalidStorageKeySizeErrorType = InvalidStorageKeySizeError & {
  name: 'InvalidStorageKeySizeError'
}
export class InvalidStorageKeySizeError extends BaseError {
  constructor({ storageKey }: { storageKey: Hex }) {
    super(
      `Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor(
        (storageKey.length - 2) / 2,
      )} bytes.`,
      { name: 'InvalidStorageKeySizeError' },
    )
  }
}

export type TransactionExecutionErrorType = TransactionExecutionError & {
  name: 'TransactionExecutionError'
}
export class TransactionExecutionError extends BaseError {
  override cause: BaseError

  constructor(
    cause: BaseError,
    {
      account,
      docsPath,
      chain,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    }: Omit<SendTransactionParameters, 'account' | 'chain'> & {
      account: Account | null
      chain?: Chain | undefined
      docsPath?: string | undefined
    },
  ) {
    const prettyArgs = prettyPrint({
      chain: chain && `${chain?.name} (id: ${chain?.id})`,
      from: account?.address,
      to,
      value:
        typeof value !== 'undefined' &&
        `${formatEther(value)} ${chain?.nativeCurrency?.symbol || 'ETH'}`,
      data,
      gas,
      gasPrice:
        typeof gasPrice !== 'undefined' && `${formatGwei(gasPrice)} gwei`,
      maxFeePerGas:
        typeof maxFeePerGas !== 'undefined' &&
        `${formatGwei(maxFeePerGas)} gwei`,
      maxPriorityFeePerGas:
        typeof maxPriorityFeePerGas !== 'undefined' &&
        `${formatGwei(maxPriorityFeePerGas)} gwei`,
      nonce,
    })

    super(cause.shortMessage, {
      cause,
      docsPath,
      metaMessages: [
        ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
        'Request Arguments:',
        prettyArgs,
      ].filter(Boolean) as string[],
      name: 'TransactionExecutionError',
    })
    this.cause = cause
  }
}

export type TransactionNotFoundErrorType = TransactionNotFoundError & {
  name: 'TransactionNotFoundError'
}
export class TransactionNotFoundError extends BaseError {
  constructor({
    blockHash,
    blockNumber,
    blockTag,
    hash,
    index,
  }: {
    blockHash?: Hash | undefined
    blockNumber?: bigint | undefined
    blockTag?: BlockTag | undefined
    hash?: Hash | undefined
    index?: number | undefined
  }) {
    let identifier = 'Transaction'
    if (blockTag && index !== undefined)
      identifier = `Transaction at block time "${blockTag}" at index "${index}"`
    if (blockHash && index !== undefined)
      identifier = `Transaction at block hash "${blockHash}" at index "${index}"`
    if (blockNumber && index !== undefined)
      identifier = `Transaction at block number "${blockNumber}" at index "${index}"`
    if (hash) identifier = `Transaction with hash "${hash}"`
    super(`${identifier} could not be found.`, {
      name: 'TransactionNotFoundError',
    })
  }
}

export type TransactionReceiptNotFoundErrorType =
  TransactionReceiptNotFoundError & {
    name: 'TransactionReceiptNotFoundError'
  }
export class TransactionReceiptNotFoundError extends BaseError {
  constructor({ hash }: { hash: Hash }) {
    super(
      `Transaction receipt with hash "${hash}" could not be found. The Transaction may not be processed on a block yet.`,
      {
        name: 'TransactionReceiptNotFoundError',
      },
    )
  }
}

export type TransactionReceiptRevertedErrorType =
  TransactionReceiptRevertedError & {
    name: 'TransactionReceiptRevertedError'
  }
export class TransactionReceiptRevertedError extends BaseError {
  receipt: TransactionReceipt

  constructor({ receipt }: { receipt: TransactionReceipt }) {
    super(`Transaction with hash "${receipt.transactionHash}" reverted.`, {
      metaMessages: [
        'The receipt marked the transaction as "reverted". This could mean that the function on the contract you are trying to call threw an error.',
        ' ',
        'You can attempt to extract the revert reason by:',
        '- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract',
        '- using the `call` Action with raw `data`',
      ],
      name: 'TransactionReceiptRevertedError',
    })

    this.receipt = receipt
  }
}

export type WaitForTransactionReceiptTimeoutErrorType =
  WaitForTransactionReceiptTimeoutError & {
    name: 'WaitForTransactionReceiptTimeoutError'
  }
export class WaitForTransactionReceiptTimeoutError extends BaseError {
  constructor({ hash }: { hash: Hash }) {
    super(
      `Timed out while waiting for transaction with hash "${hash}" to be confirmed.`,
      { name: 'WaitForTransactionReceiptTimeoutError' },
    )
  }
}
