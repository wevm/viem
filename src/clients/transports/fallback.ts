import type { Transport, TransportConfig } from './createTransport'
import { createTransport } from './createTransport'

export type FallbackTransportConfig = {
  /** The key of the Fallback transport. */
  key?: TransportConfig['key']
  /** The name of the Fallback transport. */
  name?: TransportConfig['name']
}

export type FallbackTransport = Transport<
  'fallback',
  { transports: Transport[] }
>

export function fallback(
  transports: Transport[],
  { key = 'fallback', name = 'Fallback' }: FallbackTransportConfig = {},
): FallbackTransport {
  return ({ chain }) =>
    createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          const fetch = async (i: number = 0): Promise<any> => {
            const transport = transports[i]({ chain })
            try {
              return await transport.config.request({
                method,
                params,
              } as any)
            } catch (err) {
              if (i < transports.length - 1) return fetch(i + 1)
              throw err
            }
          }
          return fetch()
        },
        type: 'fallback',
      },
      {
        transports: transports.map(
          (fn) => fn({ chain }) as unknown as Transport,
        ),
      },
    )
}
