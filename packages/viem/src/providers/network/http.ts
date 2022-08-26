import { Chain } from '../../chains'
import { rpc } from '../../utils/rpc'
import { NetworkProvider, createNetworkProvider } from './createNetworkProvider'

export type HttpProviderConfig<TChain extends Chain = Chain> = {
  /** The chain that the provider should connect to. */
  chain: TChain
  /** A key for the provider. Defaults to "http" */
  key?: string
  /** A name for the provider. Defaults to "HTTP JSON-RPC" */
  name?: string
  pollingInterval?: number
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string
}

export type HttpProvider<TChain extends Chain = Chain> = NetworkProvider<TChain>

/**
 * @description Connects to a HTTP JSON-RPC API via a URL.
 */
export function httpProvider<TChain extends Chain = Chain>({
  chain,
  key = 'http',
  name = 'HTTP JSON-RPC',
  pollingInterval,
  url = chain.rpcUrls.default.http,
}: HttpProviderConfig<TChain>): HttpProvider<TChain> {
  return createNetworkProvider({
    chain,
    key,
    name,
    pollingInterval,
    async request({ method, params }: any) {
      const { result } = await rpc.http(url, {
        body: {
          method,
          params,
        },
      })
      return result
    },
    transportMode: 'http',
  })
}
