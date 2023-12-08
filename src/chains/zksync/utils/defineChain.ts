import type { ChainFormatters } from '../../../types/chain.js'
import type { Assign } from '../../../types/utils.js'
import type { ChainConfigEIP712, ChainEIP712 } from '../types/chain.js'

export function defineChain<
  const chain extends ChainEIP712,
  formatters extends ChainFormatters | undefined = undefined,
>(
  chain: chain,
  config: ChainConfigEIP712<formatters> = {},
): Assign<chain, ChainConfigEIP712<formatters>> {
  const {
    fees = chain.fees,
    formatters = chain.formatters,
    serializers = chain.serializers,
    eip712domain = chain.eip712domain,
  } = config
  return {
    ...chain,
    fees,
    formatters,
    serializers,
    eip712domain,
  } as unknown as Assign<chain, ChainConfigEIP712<formatters>>
}
