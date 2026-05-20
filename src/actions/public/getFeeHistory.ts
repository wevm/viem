import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Block from '../../utils/Block.js'
import * as Fee from '../../utils/Fee.js'
import * as Hex from '../../utils/Hex.js'

/**
 * Returns a collection of historical gas information.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * const feeHistory = await actions.getFeeHistory(client, {
 *   blockCount: 4,
 *   rewardPercentiles: [25, 75]
 * })
 * // @log: { baseFeePerGas: [...], gasUsedRatio: [...], oldestBlock: 69420n }
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Fee history.
 */
export async function getFeeHistory<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getFeeHistory.Options,
): getFeeHistory.ReturnType {
  const {
    blockCount,
    blockNumber,
    blockTag = 'latest',
    rewardPercentiles,
  } = options
  const feeHistory = await client.request(
    {
      method: 'eth_feeHistory',
      params: [
        Hex.fromNumber(blockCount),
        blockNumber !== undefined ? Hex.fromNumber(blockNumber) : blockTag,
        [...rewardPercentiles],
      ],
    },
    { dedupe: blockNumber !== undefined },
  )
  return Fee.fromHistoryRpc(feeHistory)
}

export declare namespace getFeeHistory {
  type Options = {
    /**
     * Number of blocks in the requested range. Between 1 and 1024 blocks can
     * be requested in a single query. Less than requested may be returned if
     * not all blocks are available.
     */
    blockCount: number
    /**
     * A monotonically increasing list of percentile values to sample from
     * each block's effective priority fees per gas in ascending order,
     * weighted by gas used.
     */
    rewardPercentiles: readonly number[]
  } & (
    | {
        /** Highest number block of the requested range. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /**
         * Highest number block of the requested range.
         * @default 'latest'
         */
        blockTag?: Block.Tag | undefined
      }
  )

  type ReturnType = Promise<Fee.FeeHistory>

  type ErrorType = Hex.fromNumber.ErrorType | Fee.fromHistoryRpc.ErrorType
}
