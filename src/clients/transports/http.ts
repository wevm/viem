import { UrlRequiredError } from '../../errors'
import type { HttpOptions } from '../../utils'
import { rpc } from '../../utils'
import type { Transport, TransportConfig } from './createTransport'
import { createTransport } from './createTransport'

export type HttpTransportConfig = {
  /**
   * Request configuration to pass to `fetch`.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/fetch
   */
  fetchOptions?: HttpOptions['fetchOptions']
  /** The key of the HTTP transport. */
  key?: TransportConfig['key']
  /** The name of the HTTP transport. */
  name?: TransportConfig['name']
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount']
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay']
  /** The timeout (in ms) for the HTTP request. Default: 10_000 */
  timeout?: TransportConfig['timeout']
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
  const {
    fetchOptions,
    key = 'http',
    name = 'HTTP JSON-RPC',
    retryDelay,
    timeout = 10_000,
  } = config
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
            fetchOptions,
            timeout,
          })
          return result
        },
        retryCount,
        retryDelay,
        timeout,
        type: 'http',
      },
      {
        url,
      },
    )
  }
}
