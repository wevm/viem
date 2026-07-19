import * as Transport from '../Transport.js'

/** A load-balanced {@link Transport} that round-robins across transports. */
export type LoadBalance = Transport.Transport<
  'loadBalance',
  { transports: readonly Transport.Instance[] }
>

/**
 * Creates a {@link Transport} that distributes requests across `transports`
 * using a round-robin algorithm: each request is routed to the next transport
 * in the list, wrapping back to the first after the last.
 *
 * @example
 * ```ts
 * import { Client, http, loadBalance } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: loadBalance([
 *     http('https://1.rpc.example'),
 *     http('https://2.rpc.example'),
 *   ]),
 * })
 * ```
 */
export function loadBalance(
  transports: readonly Transport.Transport[],
  options: loadBalance.Options = {},
): LoadBalance {
  return Transport.from({
    key: options.key ?? 'loadBalance',
    name: options.name ?? 'Load Balance',
    type: 'loadBalance',
    setup({ chain, retryCount, timeout }) {
      const instances = transports.map((transport) =>
        transport.setup({ chain, retryCount: 0, timeout }),
      )
      let index = 0
      return {
        methods: options.methods,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        transports: instances,
        request(args, opts) {
          const instance = instances[index]!
          index = (index + 1) % instances.length
          return instance.request(args, opts)
        },
      }
    },
  })
}

export declare namespace loadBalance {
  type Options = {
    /** Transport key. @default 'loadBalance' */
    key?: string | undefined
    /** RPC methods to include or exclude. */
    methods?: { include?: string[] } | { exclude?: string[] } | undefined
    /** Transport name. @default 'Load Balance' */
    name?: string | undefined
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
  }
}
