import * as RpcResponse from 'ox/RpcResponse'

import * as promise from '../internal/promise.js'
import * as RpcClient from '../../utils/RpcClient.js'
import * as Transport from '../Transport.js'

/** An HTTP JSON-RPC {@link Transport}. */
export type Http = Transport.Transport<'http', { url: string }>

/** Creates an HTTP JSON-RPC transport. */
export function http(
  url?: string | undefined,
  options: http.Options = {},
): Http {
  const { batch } = options
  return Transport.from({
    key: options.key ?? 'http',
    name: options.name ?? 'HTTP JSON-RPC',
    type: 'http',
    setup({ chain, retryCount, timeout }) {
      const { batchSize = 1000, wait = 0 } =
        typeof batch === 'object' ? batch : {}
      const url_ = url ?? chain?.rpcUrls.default.http[0]
      if (!url_) throw new Transport.UrlRequiredError()
      const timeout_ = options.timeout ?? timeout ?? 10_000

      const client = RpcClient.http(url_, {
        fetchFn: options.fetchFn,
        fetchOptions: options.fetchOptions,
        onRequest: options.onFetchRequest,
        onResponse: options.onFetchResponse,
        timeout: timeout_,
      })

      return {
        methods: options.methods,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        timeout: timeout_,
        url: url_,
        async request({ method, params }, opts) {
          const body: RpcClient.RpcRequest = { method, params }
          const fetchOptions = opts?.signal
            ? { signal: opts.signal }
            : undefined

          const { schedule } = promise.createBatchScheduler({
            id: `${url_}.${getSignalId(opts?.signal)}`,
            wait,
            shouldSplitBatch: (requests) => requests.length > batchSize,
            fn: (body: RpcClient.RpcRequest[]) =>
              client.request({ body, fetchOptions }),
            sort: (a, b) => a.id - b.id,
          })

          const responses = batch
            ? await schedule(body)
            : [await client.request({ body, fetchOptions })]
          const { error, result } = responses[0] as {
            error?:
              | { code: number; message: string; data?: unknown }
              | undefined
            result?: unknown
          }

          if (options.raw) return { error, result }
          if (error) throw RpcResponse.parseError(error)
          return result
        },
      }
    },
  })
}

export declare namespace http {
  type Options = {
    /** Whether to batch JSON-RPC requests. @default false */
    batch?:
      | boolean
      | {
          /** Max requests per batch. @default 1_000 */
          batchSize?: number | undefined
          /** Max ms to wait before sending a batch. @default 0 */
          wait?: number | undefined
        }
      | undefined
    /** Override for the `fetch` function. */
    fetchFn?: RpcClient.http.Options['fetchFn'] | undefined
    /** Request configuration passed to `fetch`. */
    fetchOptions?: RpcClient.http.Options['fetchOptions'] | undefined
    /** Transport key. @default 'http' */
    key?: string | undefined
    /** RPC methods to include or exclude. */
    methods?: { include?: string[] } | { exclude?: string[] } | undefined
    /** Transport name. @default 'HTTP JSON-RPC' */
    name?: string | undefined
    /** Callback invoked before each fetch. */
    onFetchRequest?: RpcClient.http.Options['onRequest'] | undefined
    /** Callback invoked with each raw response. */
    onFetchResponse?: RpcClient.http.Options['onResponse'] | undefined
    /** Return JSON-RPC errors instead of throwing. @default false */
    raw?: boolean | undefined
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
    /** Request timeout (ms). @default 10_000 */
    timeout?: number | undefined
  }
}

// Per-signal batch scoping so abort signals don't share a batch. @internal
let signalId = 0
const signalIds = /*#__PURE__*/ new WeakMap<AbortSignal, number>()
function getSignalId(signal: AbortSignal | undefined): number | string {
  if (!signal) return 'default'
  const existing = signalIds.get(signal)
  if (existing !== undefined) return existing
  const next = signalId++
  signalIds.set(signal, next)
  return next
}
