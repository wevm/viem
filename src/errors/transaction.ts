import { BlockTag, Hash } from '../types'
import { BaseError } from './base'

export class InvalidGasArgumentsError extends BaseError {
  name = 'InvalidGasArgumentsError'
  constructor() {
    super('`maxFeePerGas` cannot be less than `maxPriorityFeePerGas`')
  }
}

export class TransactionNotFoundError extends BaseError {
  name = 'TransactionNotFoundError'
  constructor({
    blockHash,
    blockNumber,
    blockTag,
    hash,
    index,
  }: {
    blockHash?: Hash
    blockNumber?: bigint
    blockTag?: BlockTag
    hash?: Hash
    index?: number
  }) {
    let identifier = 'Transaction'
    if (blockTag && index !== undefined)
      identifier = `Transaction at block time "${blockTag}" at index "${index}"`
    if (blockHash && index !== undefined)
      identifier = `Transaction at block hash "${blockHash}" at index "${index}"`
    if (blockNumber && index !== undefined)
      identifier = `Transaction at block number "${blockNumber}" at index "${index}"`
    if (hash) identifier = `Transaction with hash "${hash}"`
    super(`${identifier} could not be found.`)
  }
}

export class TransactionReceiptNotFoundError extends BaseError {
  name = 'TransactionReceiptNotFoundError'
  constructor({ hash }: { hash: Hash }) {
    super(
      `Transaction receipt with hash "${hash}" could not be found. The Transaction may not be processed on a block yet.`,
    )
  }
}

export class WaitForTransactionReceiptTimeoutError extends BaseError {
  name = 'WaitForTransactionReceiptTimeoutError'
  constructor({ hash }: { hash: Hash }) {
    super(
      `Timed out while waiting for transaction with hash "${hash}" to be confirmed.`,
    )
  }
}
