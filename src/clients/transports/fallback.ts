import { isDeterministicError } from '../../utils/buildRequest.js'
import type { Transport, TransportConfig } from './createTransport.js'
import { createTransport } from './createTransport.js'

export type FallbackTransportConfig = {
  /** The key of the Fallback transport. */
  key?: TransportConfig['key']
  /** The name of the Fallback transport. */
  name?: TransportConfig['name']
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount']
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay']
}

export type FallbackTransport = Transport<
  'fallback',
  { transports: Transport[] }
>

export function fallback(
  transports: Transport[],
  config: FallbackTransportConfig = {},
): FallbackTransport {
  const { key = 'fallback', name = 'Fallback', retryCount, retryDelay } = config
  return ({ chain }) =>
    createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          const fetch = async (i: number = 0): Promise<any> => {
            const transport = transports[i]({ chain, retryCount: 0 })
            try {
              return await transport.request({
                method,
                params,
              } as any)
            } catch (err) {
              // If the error is deterministic, we don't need to fall back.
              // So throw the error.
              if (isDeterministicError(err as Error)) throw err

              // If we've reached the end of the fallbacks, throw the error.
              if (i === transports.length - 1) throw err

              // Otherwise, try the next fallback.
              return fetch(i + 1)
            }
          }
          return fetch()
        },
        retryCount,
        retryDelay,
        type: 'fallback',
      },
      {
        transports: transports.map(
          (fn) => fn({ chain, retryCount: 0 }) as unknown as Transport,
        ),
      },
    )
}
