import * as queue from '../internal/queue.js'
import * as Transport from '../Transport.js'

/** A rate-limited {@link Transport}. */
export type RateLimit = Transport.Transport<'rateLimit'>

/**
 * Creates a {@link Transport} that throttles the throughput of `transport` to
 * at most `requestsPerSecond` requests per second. Requests beyond the budget
 * are queued (FIFO) and dispatched as the budget refreshes.
 *
 * @example
 * ```ts
 * import { Client, http, rateLimit } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: rateLimit(http(), { requestsPerSecond: 50 }),
 * })
 * ```
 */
export function rateLimit(
  transport: Transport.Transport,
  options: rateLimit.Options,
): RateLimit {
  const { requestsPerSecond } = options
  return Transport.from({
    key: options.key ?? 'rateLimit',
    name: options.name ?? 'Rate Limit',
    type: 'rateLimit',
    setup({ chain, retryCount, timeout }) {
      const instance = transport.setup({ chain, retryCount: 0, timeout })

      type Task = {
        args: { method: string; params?: unknown }
        options: { signal?: AbortSignal | undefined } | undefined
      }
      const scheduler = queue.createQueue<Task, unknown>({
        concurrency: Math.ceil(requestsPerSecond / 4),
        frequency: requestsPerSecond,
        worker: ({ args, options }) => instance.request(args, options),
      })

      return {
        methods: options.methods,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        request: (args, opts) => scheduler.add({ args, options: opts }),
      }
    },
  })
}

export declare namespace rateLimit {
  type Options = {
    /** Transport key. @default 'rateLimit' */
    key?: string | undefined
    /** RPC methods to include or exclude. */
    methods?: { include?: string[] } | { exclude?: string[] } | undefined
    /** Transport name. @default 'Rate Limit' */
    name?: string | undefined
    /** Max number of requests per second. */
    requestsPerSecond: number
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
  }
}
