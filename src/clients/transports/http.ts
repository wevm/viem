import { UrlRequiredError } from '../../errors/index.js'
import type { HttpOptions } from '../../utils/index.js'
import { rpc } from '../../utils/index.js'
import type { Transport, TransportConfig } from './createTransport.js'
import { createTransport } from './createTransport.js'

export type HttpTransportConfig = {
  /**
   * Request configuration to pass to `fetch`.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/fetch
   */
  fetchOptions?: HttpOptions['fetchOptions'] | undefined
  /** The key of the HTTP transport. */
  key?: TransportConfig['key'] | undefined
  /** The name of the HTTP transport. */
  name?: TransportConfig['name'] | undefined
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount'] | undefined
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay'] | undefined
  /** The timeout (in ms) for the HTTP request. Default: 10_000 */
  timeout?: TransportConfig['timeout'] | undefined
}

export type HttpTransport = Transport<
  'http',
  {
    url?: string | undefined
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
  } = config
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const retryCount = config.retryCount ?? retryCount_
    const timeout = timeout_ ?? config.timeout ?? 10_000
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
