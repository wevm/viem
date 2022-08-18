import { AlchemyChain } from '../../chains'
import { HttpProvider, httpProvider } from './http'
import { WebSocketProvider, webSocketProvider } from './webSocket'

export type AlchemyProviderConfig = {
  /**
   * An Alchemy API Key. If not provided, viem will
   * default to the public Alchemy API Key. To prevent,
   * rate-limiting, you must provide your own API Key.
   * One can be created at https://dashboard.alchemyapi.io/.
   * */
  apiKey?: string
  /**
   * The chain that the provider should connect to. Only
   * the chains that Alchemy supports can be provided.
   */
  chain: AlchemyChain
}

export type AlchemyHttpProvider = HttpProvider<AlchemyChain>
export type AlchemyWebSocketProvider = WebSocketProvider<AlchemyChain>

const defaultAlchemyApiKey = '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC'

/** @description Connects to the Alchemy HTTP JSON-RPC API.  */
export function alchemyHttpProvider({
  apiKey = defaultAlchemyApiKey,
  chain,
}: AlchemyProviderConfig): AlchemyHttpProvider {
  return httpProvider({
    chain,
    id: 'alchemy-http',
    name: 'Alchemy',
    url: `${chain.rpcUrls.alchemy?.http}/${apiKey}`,
  })
}

/** @description Connects to the Alchemy HTTP JSON-RPC API.  */
export function alchemyWebSocketProvider({
  apiKey = defaultAlchemyApiKey,
  chain,
}: AlchemyProviderConfig): AlchemyWebSocketProvider {
  return webSocketProvider({
    chain,
    id: 'alchemy-webSocket',
    name: 'Alchemy',
    url: `${chain.rpcUrls.alchemy?.webSocket}/${apiKey}`,
  })
}
