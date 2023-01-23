import type { PublicClient } from '../../clients'
import type {
  BlockTag,
  EstimateGasParameters,
  RpcEstimateGasParameters,
} from '../../types'
import { numberToHex } from '../../utils'

export type EstimateGasArgs = EstimateGasParameters &
  (
    | {
        /** The balance of the account at a block number. */
        blockNumber?: bigint
        blockTag?: never
      }
    | {
        blockNumber?: never
        /** The balance of the account at a block tag. */
        blockTag?: BlockTag
      }
  )

export type EstimateGasResponse = bigint

/**
 * @description Estimates the gas necessary to complete a transaction without submitting it to the network.
 */
export async function estimateGas(
  client: PublicClient,
  {
    blockNumber,
    blockTag = 'latest',
    data,
    from,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    to,
    value,
  }: EstimateGasArgs,
): Promise<EstimateGasResponse> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
  const parameters = {
    data,
    from,
    gas: gas ? numberToHex(gas) : undefined,
    gasPrice: gasPrice ? numberToHex(gasPrice) : undefined,
    maxFeePerGas: maxFeePerGas ? numberToHex(maxFeePerGas) : undefined,
    maxPriorityFeePerGas: maxPriorityFeePerGas
      ? numberToHex(maxPriorityFeePerGas)
      : undefined,
    to,
    value: value ? numberToHex(value) : undefined,
  } as RpcEstimateGasParameters
  const balance = await client.request({
    method: 'eth_estimateGas',
    params: [parameters, blockNumberHex || blockTag],
  })
  return BigInt(balance)
}
