import { BlockTag, Hash } from '../types'
import { formatEther, formatGwei } from '../utils'
import { SendTransactionParameters } from '../wallet'
import { BaseError } from './base'

export function prettyPrint(
  args: Record<string, bigint | number | string | undefined | false>,
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

export class FeeConflictError extends BaseError {
  name = 'FeeConflictError'
  constructor() {
    super(
      [
        'Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.',
        'Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others.',
      ].join('\n'),
    )
  }
}

export class TransactionExecutionError extends BaseError {
  cause: BaseError

  name = 'TransactionExecutionError'

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
    }: SendTransactionParameters & { docsPath?: string },
  ) {
    const prettyArgs = prettyPrint({
      chain: chain && `${chain?.name} (id: ${chain?.id})`,
      from: account.address,
      to,
      value:
        typeof value !== 'undefined' &&
        `${formatEther(value)} ${chain?.nativeCurrency.symbol || 'ETH'}`,
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
    })
    this.cause = cause
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
