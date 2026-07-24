import type { Chain } from 'viem'
import { mainnet } from 'viem/chains'

export function withContract<const name extends string>(
  options: withContract.Options<name>,
) {
  return mainnet.extend({
    contracts: { ...mainnet.contracts, ...options.contracts },
  })
}

export declare namespace withContract {
  type Options<name extends string> = {
    contracts: Record<name, Chain.Chain.Contract>
  }
}
