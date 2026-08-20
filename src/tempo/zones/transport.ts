import {
  type HttpTransport,
  type HttpTransportConfig,
  http as http_,
} from '../../clients/transports/http.js'
import type { Storage } from '../Storage.js'
import * as Storage_ from '../Storage.js'

export type ZoneHttpConfig = Omit<
  HttpTransportConfig,
  'batch' | 'raw' | 'rpcSchema'
> & {
  /** Store for reading zone authorization tokens. Defaults to sessionStorage (web) or memory (server). */
  store?: Storage | undefined
}

/**
 * Creates an HTTP transport with support for Zone authentication tokens.
 *
 * Reads the authorization token from Storage and injects the
 * `X-Authorization-Token` header on every request. Batching is disabled
 * by default because zone tokens are account-scoped.
 *
 * @example
 * ```ts
 * import { createPublicClient } from 'viem'
 * import { http, zone } from 'viem/tempo/zones' // or zoneModerato
 *
 * const client = createPublicClient({
 *   chain: zone(6),
 *   transport: http(),
 * })
 * ```
 */
export function http(
  url?: string | undefined,
  config: ZoneHttpConfig = {},
): HttpTransport {
  const { store = Storage_.defaultStorage(), onFetchRequest, ...rest } = config

  return (config) =>
    http_(url, {
      ...rest,
      async onFetchRequest(request, init) {
        const next = (await onFetchRequest?.(request, init)) ?? init
        const headers = new Headers(next.headers)

        const chainId = config.chain?.id
        if (chainId) {
          const token = (await store.getItem(`auth:token:${chainId}`)) ?? null
          if (token) headers.set('X-Authorization-Token', token)
        }

        return { ...next, headers }
      },
    })(config)
}
