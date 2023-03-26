import type { PublicClient, Transport } from '../../clients'
import type { BlockTag, Chain, FeeHistory } from '../../types'

import { numberToHex } from '../../utils'
import { formatFeeHistory } from '../../utils/formatters'

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
