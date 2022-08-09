import { Chain } from '../../chains'
import { rpc } from '../../utils/rpc'
import { NetworkProvider, createNetworkProvider } from './createNetworkProvider'

export type JsonRpcProvider<TChain extends Chain = Chain> =
  NetworkProvider<TChain>

export type JsonRpcProviderConfig<TChain extends Chain = Chain> = {
  /** The chain that the provider should connect to. */
  chain: TChain
  /** A identifier for the provider. Defaults to "jsonRpc" */
  id?: string
  /** A name for the provider. Defaults to "JSON-RPC" */
  name?: string
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string
}

/**
 * @description Connects to a JSON-RPC API via a URL.
 */
export function jsonRpcProvider<TChain extends Chain = Chain>({
  chain,
  id = 'jsonRpc',
  name = 'JSON-RPC',
  url = chain.rpcUrls.default,
}: JsonRpcProviderConfig<TChain>): JsonRpcProvider<TChain> {
  return createNetworkProvider({
    chain,
    id,
    name,
    async request({ method, params }: any) {
      const { result } = await rpc.http(url, {
        body: {
          method,
          params,
        },
      })
      return result
    },
  })
}
