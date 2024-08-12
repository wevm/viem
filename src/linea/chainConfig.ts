import { lineaEstimateFeesPerGas } from '../linea/index.js'
import type { Chain } from '../types/chain.js'

export const chainConfig = {
  fees: {
    // Override the fees calculation to accurately price the fees
    // on Linea using the rpc call linea_estimateGas
    estimateFeesPerGas: lineaEstimateFeesPerGas,
    async defaultPriorityFee(args): Promise<bigint> {
      const { maxPriorityFeePerGas } = await lineaEstimateFeesPerGas({
        client: args.client,
        request: args.request,
        type: 'eip1559',
      } as any)

      if (maxPriorityFeePerGas === undefined) {
        throw new Error('maxPriorityFeePerGas is undefined')
      }

      return maxPriorityFeePerGas
    },
  },
} as const satisfies Pick<Chain, 'fees'>
