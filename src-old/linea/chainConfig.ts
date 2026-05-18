import type { ChainConfig, ChainEstimateFeesPerGasFn } from '../types/chain.js'
import { estimateGas } from './actions/estimateGas.js'

export const chainConfig = {
  fees: {
    estimateFeesPerGas,
    async maxPriorityFeePerGas({ block, client, request }) {
      const response = await estimateFeesPerGas({
        block,
        client,
        multiply: (x) => x,
        request,
        type: 'eip1559',
      })
      // Returning `null` will trigger the base `estimateMaxPriorityFeePerGas` to perform
      // fallback mechanisms to estimate priority fee.
      if (!response?.maxPriorityFeePerGas) return null
      return response.maxPriorityFeePerGas
    },
  },
} as const satisfies ChainConfig

///////////////////////////////////////////////////////////////////////////
// Internal
///////////////////////////////////////////////////////////////////////////

async function estimateFeesPerGas({
  client,
  multiply,
  request,
  type,
}: Parameters<ChainEstimateFeesPerGasFn>[0]): ReturnType<ChainEstimateFeesPerGasFn> {
  try {
    const response = await estimateGas(client, {
      ...request,
      account: request?.account!,
    })
    const { priorityFeePerGas: maxPriorityFeePerGas } = response

    const baseFeePerGas = multiply(BigInt(response.baseFeePerGas))
    const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

    if (type === 'legacy') return { gasPrice: maxFeePerGas }
    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
    }
  } catch {
    // Returning `null` will trigger the base `estimateFeesPerGas` to perform
    // fallback mechanisms to estimate fees.
    return null
  }
}
