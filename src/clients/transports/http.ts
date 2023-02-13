import { UrlRequiredError } from '../../errors'
import { rpc } from '../../utils/rpc'
import type { Transport, TransportConfig } from './createTransport'
import { createTransport } from './createTransport'

export type HttpTransportConfig = {
  /** The key of the HTTP transport. */
  key?: TransportConfig['key']
  /** The name of the HTTP transport. */
  name?: TransportConfig['name']
  /** The base delay (in ms) between retries. */
  retryCount?: TransportConfig['retryCount']
  /** The max number of times to retry. */
  retryDelay?: TransportConfig['retryDelay']
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
  config: HttpTransportConfig = {},
): HttpTransport {
  const { key = 'http', name = 'HTTP JSON-RPC', retryDelay } = config
  return ({ chain, retryCount: defaultRetryCount }) => {
    const retryCount = config.retryCount ?? defaultRetryCount
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
        retryCount,
        retryDelay,
        type: 'http',
      },
      {
        url,
      },
    )
  }
}
