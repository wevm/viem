import { AlchemyChain } from '../../chains'
import { JsonRpcProvider, jsonRpcProvider } from './jsonRpcProvider'

export type AlchemyProviderConfig = {
  apiKey?: string
  chain: AlchemyChain
}

export type AlchemyProvider = JsonRpcProvider

export type AlchemyProviderReturnValue = ((
  chain: AlchemyChain,
) => AlchemyProvider) &
  AlchemyProvider

const defaultAlchemyApiKey = '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC'

export function alchemyProvider({
  apiKey = defaultAlchemyApiKey,
  chain,
}: AlchemyProviderConfig): AlchemyProviderReturnValue {
  const provider = (chain: AlchemyChain): AlchemyProvider =>
    jsonRpcProvider({
      url: `${chain.rpcUrls.alchemy}/${apiKey}`,
    })
  return Object.assign(provider, provider(chain))
}
