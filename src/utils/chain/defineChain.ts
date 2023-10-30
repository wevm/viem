import type { Chain, ChainFormatters } from '../../types/chain.js'

export function defineChain<
  formatters extends ChainFormatters,
  const chain extends Chain<formatters>,
>(chain: chain): chain {
  return chain as any
}
