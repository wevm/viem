import type {
  ChainEstimateFeesPerGasFnParameters,
  EstimateGasParameters,
} from '../../../index.js'
import { getAction } from '../../../utils/getAction.js'
import type { LineaEstimateFeesPerGasReturnType } from '../types/fee.js'
import { lineaEstimateGas } from './lineaEstimateGas.js'

const BASE_FEE_PER_GAS_MARGIN = 1.35

/**
 * Returns an estimate for the fees per gas (in wei) for a
 * transaction to be likely included in the next block.
 *
 * @param client - Client to use
 * @param parameters - {@link ChainEstimateFeesPerGasFnParameters}
 * @returns An estimate (in wei) for the fees per gas. {@link LineaEstimateFeesPerGasReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateFeesPerGas } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const request = {
    from: "0x42c27251C710864Cf76f1b9918Ace3E585e6E21b",
    to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    value: "0x0",
  };
 * const maxPriorityFeePerGas = await lineaEstimateFeesPerGas(client,request)
 * // { maxFeePerGas: ..., maxPriorityFeePerGas: ..., gasLimit: ... }
 */
export async function lineaEstimateFeesPerGas({
  client,
  request,
  type,
}: ChainEstimateFeesPerGasFnParameters): Promise<LineaEstimateFeesPerGasReturnType> {
  if (!request) {
    throw new Error('Request parameters are missing')
  }

  const lineaEstimateGasResponse = await getAction(
    client,
    lineaEstimateGas,
    'lineaEstimateGas',
  )({
    data: request.data,
    to: request.to,
    ...request,
  } as unknown as EstimateGasParameters)

  if (!lineaEstimateGasResponse) {
    throw new Error('Failed to get the linea estimated gas from RPC')
  }

  const { baseFeePerGas, priorityFeePerGas, gasLimit } =
    lineaEstimateGasResponse
  const adjustedPriorityFeePerGas = BigInt(priorityFeePerGas) * BigInt(2);
  const adjustedBaseFee =
    (BigInt(baseFeePerGas) * BigInt(BASE_FEE_PER_GAS_MARGIN * 100)) /
    BigInt(100)
  const gasPrice = adjustedBaseFee + adjustedPriorityFeePerGas

  if (type === 'legacy') return { gasPrice, gasLimit }
  return {
    maxFeePerGas: gasPrice,
    maxPriorityFeePerGas: adjustedPriorityFeePerGas,
    gasLimit,
  }
}
