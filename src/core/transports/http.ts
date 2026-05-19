import type * as RpcResponse from 'ox/RpcResponse'
import type * as RpcSchema from 'ox/RpcSchema'

import * as Transport from '../Transport.js'
import { getAbortError, isAbortError } from '../internal/errors.js'
import { createBatchScheduler, withTimeout } from '../internal/promise.js'
import {
  HttpRequestError,
  RpcRequestError,
  TimeoutError,
} from '../internal/request.js'
import { stringify } from '../internal/stringify.js'

type JsonRpcRequest = {
  id?: number | undefined
  jsonrpc?: '2.0' | undefined
  method: string
  params?: unknown | undefined
}

type JsonRpcResponse = RpcResponse.RpcResponse

type MaybePromise<value> = Promise<value> | value

let id = 0
let signalId = 0
const signalIds = new WeakMap<AbortSignal, number>()

/**
 * Creates a HTTP JSON-RPC Transport from a URL.
 *
 * @example
 * ```ts twoslash
 * import { http } from 'viem'
 *
 * const transport = http('https://1.rpc.thirdweb.com')
 *
 * // TODO(v3): Replace with Client.create({ transport }) once Client lands.
 * const client = transport({})
 * const blockNumber = await client.request({ method: 'eth_blockNumber' })
 * // @log: '0x1a2b3c'
 * ```
 *
 * @param url - URL to perform the JSON-RPC requests to.
 * @param options - Transport options.
 * @returns HTTP JSON-RPC Transport.
 */
export function http<
  schema extends RpcSchema.Generic | undefined = undefined,
  raw extends boolean = false,
>(
  url?: string | undefined,
  options: http.Options<schema, raw> = {},
): http.Transport<schema, raw> {
  const {
    batch,
    fetchFn,
    fetchOptions,
    key = 'http',
    methods,
    name = 'HTTP JSON-RPC',
    onFetchRequest,
    onFetchResponse,
    retryDelay,
    raw,
  } = options

  return (({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const { batchSize = 1000, wait = 0 } =
      typeof batch === 'object' ? batch : {}
    const retryCount = options.retryCount ?? retryCount_
    const timeout = timeout_ ?? options.timeout ?? 10_000
    const url_ = url ?? chain?.rpcUrls.default.http[0]
    if (!url_) throw new Transport.UrlRequiredError()

    const rpcClient = getHttpRpcClient(url_, {
      fetchFn,
      fetchOptions,
      onRequest: onFetchRequest,
      onResponse: onFetchResponse,
      timeout,
    })

    return Transport.create(
      {
        key,
        methods,
        name,
        async request(request, requestOptions) {
          const body = {
            method: request.method,
            params: request.params,
          }
          const requestFetchOptions = requestOptions?.signal
            ? { signal: requestOptions.signal }
            : undefined

          const { schedule } = createBatchScheduler<
            JsonRpcRequest,
            readonly JsonRpcResponse[]
          >({
            id: `${url_}.${getSignalId(requestOptions?.signal)}`,
            wait,
            shouldSplitBatch(requests) {
              return requests.length > batchSize
            },
            fn: (requests) =>
              rpcClient.request({
                body: requests,
                fetchOptions: requestFetchOptions,
              }),
            sort: (a, b) => a.id - b.id,
          })

          const response = batch
            ? (await schedule(body))[0]
            : await rpcClient.request({
                body,
                fetchOptions: requestFetchOptions,
              })

          const { error, result } = response
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
  }) as http.Transport<schema, raw>
}

export declare namespace http {
  /** Options for a HTTP JSON-RPC Transport. */
  type Options<
    schema extends RpcSchema.Generic | undefined = undefined,
    raw extends boolean = false,
  > = {
    /**
     * Enables JSON-RPC batching.
     *
     * @default false
     */
    batch?:
      | boolean
      | {
          /** Maximum number of requests to include in a batch. */
          batchSize?: number | undefined
          /** Time to wait before sending a batch in milliseconds. */
          wait?: number | undefined
        }
      | undefined
    /** Function to use to make the request. */
    fetchFn?: HttpRpcClientOptions['fetchFn'] | undefined
    /** Request configuration to pass to `fetch`. */
    fetchOptions?: HttpRpcClientOptions['fetchOptions'] | undefined
    /** Function to call before a `fetch` request. */
    onFetchRequest?: HttpRpcClientOptions['onRequest'] | undefined
    /** Function to call after a `fetch` response. */
    onFetchResponse?: HttpRpcClientOptions['onResponse'] | undefined
    /** Transport key. */
    key?: string | undefined
    /** Methods to include or exclude from this Transport. */
    methods?: Transport.Methods | undefined
    /** Transport display name. */
    name?: string | undefined
    /**
     * Returns raw JSON-RPC `{ error, result }` responses.
     *
     * @default false
     */
    raw?: raw | boolean | undefined
    /** Retry count. */
    retryCount?: number | undefined
    /** Retry delay in milliseconds. */
    retryDelay?: number | undefined
    /** Typed JSON-RPC schema. */
    rpcSchema?: schema | RpcSchema.Generic | undefined
    /**
     * Request timeout in milliseconds.
     *
     * @default 10_000
     */
    timeout?: number | undefined
  }

  /** HTTP JSON-RPC Transport. */
  type Transport<
    schema extends RpcSchema.Generic | undefined = undefined,
    raw extends boolean = false,
  > = Transport.Transport<
    'http',
    {
      fetchOptions?: Options['fetchOptions'] | undefined
      url?: string | undefined
    },
    Transport.RequestFn<
      schema extends RpcSchema.Generic ? schema : RpcSchema.Generic,
      raw
    >
  >
}

type HttpRpcClientOptions = {
  fetchFn?:
    | ((input: string | URL | Request, init?: RequestInit) => Promise<Response>)
    | undefined
  fetchOptions?: Omit<RequestInit, 'body'> | undefined
  onRequest?:
    | ((
        request: Request,
        init: RequestInit,
      ) => MaybePromise<
        void | undefined | (RequestInit & { url?: string | undefined })
      >)
    | undefined
  onResponse?: ((response: Response) => MaybePromise<void>) | undefined
  timeout?: number | undefined
}

type HttpRpcClient = {
  request<body extends JsonRpcRequest | readonly JsonRpcRequest[]>(options: {
    body: body
    fetchOptions?: Omit<RequestInit, 'body'> | undefined
  }): Promise<
    body extends readonly JsonRpcRequest[] ? JsonRpcResponse[] : JsonRpcResponse
  >
}

function getHttpRpcClient(
  url_: string,
  options: HttpRpcClientOptions = {},
): HttpRpcClient {
  const { headers: urlHeaders, url } = parseUrl(url_)

  return {
    async request({ body, fetchOptions: fetchOptions_ }) {
      const {
        fetchFn = options.fetchFn ?? fetch,
        onRequest = options.onRequest,
        onResponse = options.onResponse,
        timeout = options.timeout as number,
      } = options

      const fetchOptions = {
        ...(options.fetchOptions ?? {}),
        ...(fetchOptions_ ?? {}),
      }
      const { headers, method, signal: signal_ } = fetchOptions

      try {
        const response = await withTimeout(
          async ({ signal }) => {
            const body_ = Array.isArray(body)
              ? body.map(withJsonRpcProperties)
              : withJsonRpcProperties(body as JsonRpcRequest)
            const init: RequestInit = {
              ...fetchOptions,
              body: stringify(body_),
              headers: {
                ...urlHeaders,
                'Content-Type': 'application/json',
                ...headers,
              },
              method: method ?? 'POST',
              /* c8 ignore next */
              signal: signal_ ?? (timeout > 0 ? signal : null),
            }
            const request = new Request(url, init)
            const requestOptions = (await onRequest?.(request, init)) ?? {
              ...init,
              url,
            }
            return fetchFn(requestOptions.url ?? url, requestOptions)
          },
          {
            errorInstance: new TimeoutError({ body, url }),
            signal: true,
            timeout,
          },
        )

        await onResponse?.(response)

        const data = await parseResponse(response)
        if (!response.ok) {
          if (
            typeof data.error?.code === 'number' &&
            typeof data.error?.message === 'string'
          )
            return data
          throw new HttpRequestError({
            body: body as JsonRpcRequest,
            /* c8 ignore next */
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url,
          })
        }
        return data
      } catch (error) {
        if (signal_?.aborted) throw getAbortError(signal_)
        if (isAbortError(error)) throw error
        if (error instanceof HttpRequestError) throw error
        if (error instanceof TimeoutError) throw error
        throw new HttpRequestError({
          body,
          cause: error as Error,
          url,
        })
      }
    },
  }
}

async function parseResponse(response: Response) {
  if (response.headers.get('Content-Type')?.startsWith('application/json'))
    return response.json()

  const text = await response.text()
  try {
    return JSON.parse(text || '{}')
  } catch (error) {
    if (response.ok) throw error
    return { error: text }
  }
}

function parseUrl(url_: string) {
  try {
    const url = new URL(url_)
    if (!url.username) return { url: url.toString() }

    const credentials = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
    url.username = ''
    url.password = ''
    return {
      headers: { Authorization: `Basic ${btoa(credentials)}` },
      url: url.toString(),
    }
  } catch {
    /* c8 ignore next */
    return { url: url_ }
  }
}

function getSignalId(signal: AbortSignal | undefined) {
  if (!signal) return 'default'
  const existing = signalIds.get(signal)
  if (existing !== undefined) return existing
  const next = signalId++
  signalIds.set(signal, next)
  return next
}

function withJsonRpcProperties(body: JsonRpcRequest) {
  return {
    ...body,
    jsonrpc: '2.0' as const,
    id: body.id ?? id++,
  }
}
