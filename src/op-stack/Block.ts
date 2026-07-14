import { Block as ox_Block } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import { BaseError } from '../core/Errors.js'
import { get } from '../core/actions/block/get.js'
import * as Transaction from './Transaction.js'

/** OP Stack block. */
export type Block<
  includeTransactions extends boolean = false,
  blockTag extends ox_Block.Tag = 'latest',
> = ox_Block.Block<
  includeTransactions,
  blockTag,
  bigint,
  number,
  Transaction.Transaction<blockTag extends 'pending' ? true : false>
>

/** OP Stack RPC block. */
export type Rpc<
  includeTransactions extends boolean = boolean,
  blockTag extends ox_Block.Tag = 'latest',
> = ox_Block.Rpc<
  includeTransactions,
  blockTag,
  Transaction.Rpc<blockTag extends 'pending' ? true : false>
>

/**
 * Converts an OP Stack RPC block to its native representation.
 *
 * @param block - OP Stack RPC block.
 * @param options - Conversion options.
 * @returns Native OP Stack block.
 */
export function fromRpc<
  const block extends Rpc | null,
  includeTransactions extends boolean = false,
  blockTag extends ox_Block.Tag = 'latest',
>(
  block: block | Rpc<boolean, blockTag> | null,
  options: fromRpc.Options<includeTransactions, blockTag> = {},
): fromRpc.ReturnType<block, includeTransactions, blockTag> {
  if (!block)
    return null as fromRpc.ReturnType<block, includeTransactions, blockTag>

  // Conditional transaction inclusion requires the final cast.
  return {
    ...ox_Block.fromRpc(block as ox_Block.Rpc, options),
    transactions: block.transactions.map((transaction) => {
      if (typeof transaction === 'string') return transaction
      return Transaction.fromRpc(transaction)
    }),
  } as unknown as fromRpc.ReturnType<block, includeTransactions, blockTag>
}

export declare namespace fromRpc {
  /** Options for {@link fromRpc}. */
  type Options<
    includeTransactions extends boolean = false,
    blockTag extends ox_Block.Tag = 'latest',
  > = ox_Block.fromRpc.Options<includeTransactions, blockTag>

  /** Return type for {@link fromRpc}. */
  type ReturnType<
    block extends Rpc | null,
    includeTransactions extends boolean = false,
    blockTag extends ox_Block.Tag = 'latest',
  > = block extends Rpc ? Block<includeTransactions, blockTag> : null

  /** Errors thrown by {@link fromRpc}. */
  type ErrorType =
    | ox_Block.fromRpc.ErrorType
    | Transaction.fromRpc.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Returns the L2 block number corresponding to an aligned timestamp.
 *
 * @param client - OP Stack L2 Client.
 * @param options - Options.
 * @returns L2 block number.
 */
export async function getNumberAtTimestamp<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getNumberAtTimestamp.Options,
): Promise<getNumberAtTimestamp.ReturnType> {
  const latest = await get(client)
  if (latest.number === null)
    throw new TimestampError('Latest L2 block number is unavailable.')
  if (latest.number === 0n)
    throw new TimestampError('Cannot derive L2 block time from genesis block.')

  const parent = await get(client, { blockNumber: latest.number - 1n })
  const blockTime = latest.timestamp - parent.timestamp
  if (blockTime === 0n) throw new TimestampError('L2 block time is zero.')

  const timeDiff = latest.timestamp - options.timestamp
  if (timeDiff < 0n)
    throw new TimestampError('Timestamp is in the future relative to L2 head.')
  if (timeDiff % blockTime !== 0n)
    throw new TimestampError('Timestamp does not align with the L2 block time.')

  const blocksToLookBack = timeDiff / blockTime
  if (blocksToLookBack > latest.number)
    throw new TimestampError('Timestamp predates L2 genesis.')

  return latest.number - blocksToLookBack
}

export declare namespace getNumberAtTimestamp {
  /** Options for {@link getNumberAtTimestamp}. */
  type Options = {
    /** L2 block timestamp. */
    timestamp: bigint
  }

  /** Return type for {@link getNumberAtTimestamp}. */
  type ReturnType = bigint

  /** Errors thrown by {@link getNumberAtTimestamp}. */
  type ErrorType = get.ErrorType | TimestampError | Errors.GlobalErrorType
}

/** Thrown when an L2 timestamp cannot be mapped to a block number. */
export class TimestampError extends BaseError {
  override readonly name = 'OpStack.Block.TimestampError'
}
