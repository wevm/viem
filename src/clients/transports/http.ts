import { rpc } from '../../utils/rpc'
import type { Transport, TransportConfig } from './createTransport'
import { createTransport } from './createTransport'
import { UrlRequiredError } from './errors'

export type HttpTransportConfig = {
  /** The key of the HTTP transport. */
  key?: TransportConfig['key']
  /** The name of the HTTP transport. */
  name?: TransportConfig['name']
}

export type HttpTransport = Transport<
  'http',
  {
    url?: string
  }
>

/**
 * @description Creates a HTTP transport that connects to a JSON-RPC API.
 */
export function http(
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string,
  { key = 'http', name = 'HTTP JSON-RPC' }: HttpTransportConfig = {},
): HttpTransport {
  return ({ chain }) => {
    const url_ = url || chain?.rpcUrls.default.http[0]
    if (!url_) throw new UrlRequiredError()
    return createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          const { result } = await rpc.http(url_, {
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
}
