import type * as Transport from '../../core/Transport.js'
import { http as http_ } from '../../core/transports/http.js'
import * as Storage from '../Storage.js'

/**
 * Creates an HTTP JSON-RPC transport with support for Zone authorization
 * tokens.
 *
 * Reads the authorization token for the client's chain from {@link Storage}
 * and injects the `X-Authorization-Token` header on every request. Batching
 * is not supported because zone tokens are account-scoped.
 *
 * @example
 * ```ts
 * import { Client } from 'viem/tempo'
 * import { http, zone } from 'viem/tempo/zones'
 *
 * const client = Client.create({
 *   chain: zone(6),
 *   transport: http(),
 * })
 * ```
 *
 * @param url - RPC URL. Defaults to the chain's default RPC URL.
 * @param options - Options.
 * @returns An HTTP transport.
 */
export function http(
  url?: string | undefined,
  options: http.Options = {},
): Transport.Http {
  const {
    onFetchRequest,
    storage = Storage.defaultStorage(),
    ...rest
  } = options
  return {
    key: rest.key ?? 'http',
    name: rest.name ?? 'HTTP JSON-RPC',
    type: 'http',
    setup(setupOptions = {}) {
      const chainId = setupOptions.chain?.id
      return http_(url, {
        ...rest,
        async onFetchRequest(request, init) {
          const next = (await onFetchRequest?.(request, init)) ?? init
          const headers = new Headers(next.headers)

          if (chainId) {
            const token = await storage.getItem(`auth:token:${chainId}`)
            if (token) headers.set('X-Authorization-Token', token)
          }

          return { ...next, headers }
        },
      }).setup(setupOptions)
    },
  }
}

export declare namespace http {
  type Options = Omit<http_.Options, 'batch' | 'raw'> & {
    /** Storage for reading zone authorization tokens. Defaults to sessionStorage (web) or memory (server). */
    storage?: Storage.Storage | undefined
  }
}
