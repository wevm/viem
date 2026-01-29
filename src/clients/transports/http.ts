import { RpcRequestError } from '../../errors/request.js'
import {
  UrlRequiredError,
  type UrlRequiredErrorType,
} from '../../errors/transport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { EIP1193RequestFn, RpcSchema } from '../../types/eip1193.js'
import type { RpcRequest } from '../../types/rpc.js'
import { createBatchScheduler } from '../../utils/promise/createBatchScheduler.js'
import {
  type HttpRpcClientOptions,
  getHttpRpcClient,
} from '../../utils/rpc/http.js'

import {
  type CreateTransportErrorType,
  type Transport,
  type TransportConfig,
  createTransport,
} from './createTransport.js'

export type HttpTransportConfig<
  rpcSchema extends RpcSchema | undefined = undefined,
  raw extends boolean = false,
> = {
  /**
   * Whether to enable Batch JSON-RPC.
   * @link https://www.jsonrpc.org/specification#batch
   */
  batch?:
    | boolean
    | {
        /** The maximum number of JSON-RPC requests to send in a batch. @default 1_000 */
        batchSize?: number | undefined
        /** The maximum number of milliseconds to wait before sending a batch. @default 0 */
        wait?: number | undefined
      }
    | undefined
  /**
   * Request configuration to pass to `fetch`.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/fetch
   */
  fetchOptions?: HttpRpcClientOptions['fetchOptions'] | undefined
  /** A callback to handle the response from `fetch`. */
  onFetchRequest?: HttpRpcClientOptions['onRequest'] | undefined
  /** A callback to handle the response from `fetch`. */
  onFetchResponse?: HttpRpcClientOptions['onResponse'] | undefined
  /** The key of the HTTP transport. */
  key?: TransportConfig['key'] | undefined
  /** Methods to include or exclude from executing RPC requests. */
  methods?: TransportConfig['methods'] | undefined
  /** The name of the HTTP transport. */
  name?: TransportConfig['name'] | undefined
  /** Whether to return JSON RPC errors as responses instead of throwing. */
  raw?: raw | boolean | undefined
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount'] | undefined
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay'] | undefined
  /** Typed JSON-RPC schema for the transport. */
  rpcSchema?: rpcSchema | RpcSchema | undefined
  /** The timeout (in ms) for the HTTP request. Default: 10_000 */
  timeout?: TransportConfig['timeout'] | undefined
}

export type HttpTransport<
  rpcSchema extends RpcSchema | undefined = undefined,
  raw extends boolean = false,
> = Transport<
  'http',
  {
    fetchOptions?: HttpTransportConfig['fetchOptions'] | undefined
    url?: string | undefined
  },
  EIP1193RequestFn<rpcSchema, raw>
>

export type HttpTransportErrorType =
  | CreateTransportErrorType
  | UrlRequiredErrorType
  | ErrorType

/**
 * @description Creates a HTTP transport that connects to a JSON-RPC API.
 */
export function http<
  rpcSchema extends RpcSchema | undefined = undefined,
  raw extends boolean = false,
>(
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string | undefined,
  config: HttpTransportConfig<rpcSchema, raw> = {},
): HttpTransport<rpcSchema, raw> {
  const {
    batch,
    fetchOptions,
    key = 'http',
    methods,
    name = 'HTTP JSON-RPC',
    onFetchRequest,
    onFetchResponse,
    retryDelay,
    raw,
  } = config
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const { batchSize = 1000, wait = 0 } =
      typeof batch === 'object' ? batch : {}
    const retryCount = config.retryCount ?? retryCount_
    const timeout = timeout_ ?? config.timeout ?? 10_000
    const url_ = url || chain?.rpcUrls.default.http[0]
    if (!url_) throw new UrlRequiredError()

    const rpcClient = getHttpRpcClient(url_, {
      fetchOptions,
      onRequest: onFetchRequest,
      onResponse: onFetchResponse,
      timeout,
    })

    return createTransport(
      {
        key,
        methods,
        name,
        async request({ method, params }) {
          const body = { method, params }

          const { schedule } = createBatchScheduler({
            id: url_,
            wait,
            shouldSplitBatch(requests) {
              return requests.length > batchSize
            },
            fn: (body: RpcRequest[]) =>
              rpcClient.request({
                body,
              }),
            sort: (a, b) => a.id - b.id,
          })

          const fn = async (body: RpcRequest) =>
            batch
              ? schedule(body)
              : [
                  await rpcClient.request({
                    body,
                  }),
                ]

          const [{ error, result }] = await fn(body)

          if (raw) return { error, result }
          if (error)
            throw new RpcRequestError({
              body,
              error,
              url: url_,
            })
          return result
        },
        retryCount,
        retryDelay,
        timeout,
        type: 'http',
      },
      {
        fetchOptions,
        url: url_,
      },
    )
  }
}
