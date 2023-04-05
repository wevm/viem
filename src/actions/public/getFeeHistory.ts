import type { PublicClient, Transport } from '../../clients/index.js'
import type { BlockTag, Chain, FeeHistory } from '../../types/index.js'

import { numberToHex } from '../../utils/index.js'
import { formatFeeHistory } from '../../utils/formatters/index.js'

export type GetFeeHistoryParameters = {
  blockCount: number
  rewardPercentiles: number[]
} & (
  | {
      blockNumber?: never
      blockTag?: BlockTag
    }
  | {
      blockNumber?: bigint
      blockTag?: never
    }
)
export type GetFeeHistoryReturnType = FeeHistory

/**
 * @description Returns a collection of historical gas information.
 */
export async function getFeeHistory<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
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
