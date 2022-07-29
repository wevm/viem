import { AlchemyChain } from '../../types'
import { JsonRpcProvider, jsonRpcProvider } from './jsonRpcProvider'

export type AlchemyProviderConfig = {
  apiKey?: string
  chains: AlchemyChain[]
}

export type AlchemyProvider = JsonRpcProvider<AlchemyChain>

export type AlchemyProviderReturnValue = ((
  chain: AlchemyChain,
) => AlchemyProvider) &
  AlchemyProvider

const defaultAlchemyApiKey = '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC'

export function alchemyProvider({
  apiKey = defaultAlchemyApiKey,
  chains,
}: AlchemyProviderConfig): AlchemyProviderReturnValue {
  const provider = (chain: AlchemyChain): AlchemyProvider =>
    jsonRpcProvider({
      chains,
      url: `${chain.rpcUrls.alchemy}/${apiKey}`,
    })
  return Object.assign(provider, provider(chains[0]))
}
