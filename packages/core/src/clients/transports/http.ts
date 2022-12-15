import type { Chain } from '../../chains'
import { rpc } from '../../utils/rpc'
import type { Transport, TransportConfig } from './createTransport'
import { createTransport } from './createTransport'

export type HttpTransportConfig<TChain extends Chain = Chain> = {
  /** The chain that the RPC should connect to. */
  chain: TChain
  /** The key of the HTTP transport. */
  key?: TransportConfig['key']
  /** The name of the HTTP transport. */
  name?: TransportConfig['name']
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string
}

export type HttpTransport<TChain extends Chain = Chain> = Transport<
  'http',
  {
    url: string
  },
  TChain
>

/**
 * @description Creates a HTTP transport that connects to a JSON-RPC API.
 */
export function http<TChain extends Chain = Chain>({
  chain,
  key = 'http',
  name = 'HTTP JSON-RPC',
  url = chain.rpcUrls.default.http[0],
}: HttpTransportConfig<TChain>): HttpTransport<TChain> {
  return createTransport(
    {
      chain,
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
      type: 'http',
    },
    {
      url,
    },
  )
}
