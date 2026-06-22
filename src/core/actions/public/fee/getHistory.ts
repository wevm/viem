import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Fee from 'ox/Fee'
import * as Hex from 'ox/Hex'
import { z } from 'ox/zod'

import type * as Client from '../../../Client.js'

/**
 * Returns a collection of historical gas information.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const feeHistory = await Actions.fee.getHistory(client, {
 *   blockCount: 4,
 *   rewardPercentiles: [25, 75],
 * })
 * ```
 */
export async function getHistory(
  client: Client.Client,
  options: getHistory.Options,
): Promise<getHistory.ReturnType> {
  const {
    blockCount,
    blockNumber,
    blockTag = 'latest',
    rewardPercentiles,
  } = options

  const schema = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_feeHistory')

  const feeHistory = await client.request(
    {
      method: 'eth_feeHistory',
      params: z.RpcSchema.encodeParams(schema, [
        Hex.fromNumber(blockCount),
        typeof blockNumber === 'bigint' ? blockNumber : blockTag,
        [...rewardPercentiles],
      ]),
    },
    { dedupe: typeof blockNumber === 'bigint' },
  )

  return z.RpcSchema.decodeReturns(schema, feeHistory)
}

export declare namespace getHistory {
  type Options = {
    /**
     * Number of blocks in the requested range. Between 1 and 1024 blocks can be
     * requested in a single query. Less than requested may be returned if not
     * all blocks are available.
     */
    blockCount: number
    /**
     * A monotonically increasing list of percentile values to sample from each
     * block's effective priority fees per gas in ascending order, weighted by
     * gas used.
     */
    rewardPercentiles: readonly number[]
  } & (
    | {
        blockNumber?: undefined
        /** Highest number block of the requested range. @default 'latest' */
        blockTag?: Block.Tag | undefined
      }
    | {
        /** Highest number block of the requested range. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
  )

  type ReturnType = Fee.FeeHistory

  type ErrorType = Errors.GlobalErrorType
}
