import { Chain } from '../../chains'
import { rpc } from '../../utils/rpc'
import { Adapter, AdapterConfig, createAdapter } from './createAdapter'

export type HttpAdapterConfig<TChain extends Chain = Chain> = {
  /** The chain that the RPC should connect to. */
  chain: TChain
  /** The key of the HTTP adapter. */
  key?: AdapterConfig['key']
  /** The name of the HTTP adapter. */
  name?: AdapterConfig['name']
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string
}

export type HttpAdapter<TChain extends Chain = Chain> = Adapter<
  'network',
  {
    chain: TChain
    transportMode: 'http'
    url: string
  }
>

/**
 * @description Creates a HTTP adapter that connects to a JSON-RPC API.
 */
export function http<TChain extends Chain = Chain>({
  chain,
  key = 'http',
  name = 'HTTP JSON-RPC',
  url = chain.rpcUrls.default.http,
}: HttpAdapterConfig<TChain>): HttpAdapter<TChain> {
  return createAdapter(
    {
      key,
      name,
      async request({ method, params }) {
        const { result } = await rpc.http(url, {
          body: {
            method,
            params,
          },
        })
        return result
      },
      type: 'network',
    },
    {
      chain,
      transportMode: 'http',
      url,
    },
  )
}
