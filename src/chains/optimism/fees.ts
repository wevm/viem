import type { ChainFees } from '../../types/chain.js'

export const feesOptimism = {
  getDefaultPriorityFee: () => 1_000_000n, // 0.001 gwei
} as const satisfies ChainFees
