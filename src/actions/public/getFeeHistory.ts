import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { FeeHistory } from '../../types/fee.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type FormatFeeHistoryErrorType,
  formatFeeHistory,
} from '../../utils/formatters/feeHistory.js'

export type GetFeeHistoryParameters = {
  /**
   * Number of blocks in the requested range. Between 1 and 1024 blocks can be requested in a single query. Less than requested may be returned if not all blocks are available.
   */
  blockCount: number
  /**
   * A monotonically increasing list of percentile values to sample from each block's effective priority fees per gas in ascending order, weighted by gas used.
   */
  rewardPercentiles: number[]
} & (
  | {
      blockNumber?: never
      /**
       * Highest number block of the requested range.
       * @default 'latest'
       */
      blockTag?: BlockTag
    }
  | {
      /** Highest number block of the requested range. */
      blockNumber?: bigint
      blockTag?: never
    }
)
export type GetFeeHistoryReturnType = FeeHistory

export type GetFeeHistoryErrorType =
  | NumberToHexErrorType
  | RequestErrorType
  | FormatFeeHistoryErrorType

/**
 * Returns a collection of historical gas information.
 *
 * - Docs: https://viem.sh/docs/actions/public/getFeeHistory
 * - JSON-RPC Methods: [`eth_feeHistory`](https://docs.alchemy.com/reference/eth-feehistory)
 *
 * @param client - Client to use
 * @param parameters - {@link GetFeeHistoryParameters}
 * @returns The gas estimate (in wei). {@link GetFeeHistoryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getFeeHistory } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const feeHistory = await getFeeHistory(client, {
 *   blockCount: 4,
 *   rewardPercentiles: [25, 75],
 * })
 */
export async function getFeeHistory<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  {
    blockCount,
    blockNumber,
    blockTag = 'latest',
    rewardPercentiles,
  }: GetFeeHistoryParameters,
): Promise<GetFeeHistoryReturnType> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
  const feeHistory = await client.request({
    method: 'eth_feeHistory',
    params: [
      numberToHex(blockCount),
      blockNumberHex || blockTag,
      rewardPercentiles,
    ],
  })
  return formatFeeHistory(feeHistory)
}
