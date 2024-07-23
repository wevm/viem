import { getBlock, getGasPrice } from '../../actions/index.js'
import { internal_estimateMaxPriorityFeePerGas } from '../../actions/public/estimateMaxPriorityFeePerGas.js'
import {
  http,
  type Block,
  type Chain,
  type ChainEstimateFeesPerGasFnParameters,
  type Client,
  Eip1559FeesNotSupportedError,
  type EstimateGasParameters,
  type Transport,
  createPublicClient,
} from '../../index.js'
import { getAction } from '../../utils/getAction.js'
import { linea, lineaTestnet } from '../chains.js'
import type {
  LineaEstimateFeesPerGasReturnType,
  LineaEstimateGasReturnType,
} from '../types/fee.js'
import { lineaEstimateGas } from './lineaEstimateGas.js'

const BASE_FEE_PER_GAS_MARGIN = 1.35

/**
 * Returns an estimate for the fees per gas (in wei) for a
 * transaction to be likely included in the next block.
 *
 * @param client - Client to use
 * @param parameters - {@link ChainEstimateFeesPerGasFnParameters}
 * @returns An estimate (in wei) for the base fee per gas, the priority fee per gas and the gas limit. {@link LineaEstimateFeesPerGasReturnType}
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
 *
 * const estimatedFeesPerGas = await lineaEstimateFeesPerGas({
 *   client,
 *   request: requestExample,
 * } as any);
 * // { maxFeePerGas: ..., maxPriorityFeePerGas: ..., gasLimit: ... }
 */
export async function lineaEstimateFeesPerGas({
  multiply,
  block,
  client,
  request,
  type,
}: ChainEstimateFeesPerGasFnParameters): Promise<LineaEstimateFeesPerGasReturnType> {
  if (!request) {
    throw new Error('Request parameters are missing')
  }

  let lineaEstimateGasResponse: LineaEstimateGasReturnType
  try {
    lineaEstimateGasResponse = await getAction(
      client,
      lineaEstimateGas,
      'lineaEstimateGas',
    )({
      data: request.data,
      to: request.to,
      ...request,
    } as unknown as EstimateGasParameters)
  } catch (_err) {
    try {
      // Try with the public endpoint
      const publicClient = createPublicClient({
        chain: client.chain.id === linea.id ? linea : lineaTestnet,
        transport: http(),
      })
      lineaEstimateGasResponse = await getAction(
        publicClient,
        lineaEstimateGas,
        'lineaEstimateGas',
      )({
        data: request.data,
        to: request.to,
        ...request,
      } as unknown as EstimateGasParameters)
    } catch (_err) {
      // Return the result using the standard eth_gasPrice method
      return lineaEstimateFeesPerGasFallback({
        multiply,
        block,
        client,
        request,
        type,
      })
    }
  }

  const { baseFeePerGas, priorityFeePerGas, gasLimit } =
    lineaEstimateGasResponse

  const adjustedPriorityFeePerGas = BigInt(priorityFeePerGas)
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

async function lineaEstimateFeesPerGasFallback({
  multiply,
  block,
  client,
  request,
  type,
}: ChainEstimateFeesPerGasFnParameters): Promise<LineaEstimateFeesPerGasReturnType> {
  const block_ = block
    ? block
    : await getAction(client, getBlock, 'getBlock')({})
  if (block && type === 'eip1559') {
    if (typeof block_.baseFeePerGas !== 'bigint')
      throw new Eip1559FeesNotSupportedError()

    const maxPriorityFeePerGas =
      typeof request?.maxPriorityFeePerGas === 'bigint'
        ? request.maxPriorityFeePerGas
        : await internal_estimateMaxPriorityFeePerGas(
            client as Client<Transport, Chain>,
            {
              block: block_ as Block,
              chain: client.chain,
              request,
            },
          )

    const baseFeePerGas = multiply(block_.baseFeePerGas)
    const maxFeePerGas =
      request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
    } as LineaEstimateFeesPerGasReturnType
  }

  const gasPrice =
    request?.gasPrice ??
    multiply(await getAction(client, getGasPrice, 'getGasPrice')({}))
  return {
    gasPrice,
  } as LineaEstimateFeesPerGasReturnType
}
