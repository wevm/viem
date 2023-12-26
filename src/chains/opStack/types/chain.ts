import type { Chain, ChainContract } from '../../../types/chain.js'

export type TargetChain<chain extends Chain, contractName extends string> = {
  contracts: {
    [_ in contractName]: { [_ in chain['id']]: ChainContract }
  }
}
