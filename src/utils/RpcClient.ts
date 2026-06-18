import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import type * as RpcRequest_ox from 'ox/RpcRequest'
import * as RpcResponse from 'ox/RpcResponse'
import type * as RpcSchema from 'ox/RpcSchema'

import ReconnectingWebSocket from '../vendor/partysocket/ws.js'
import * as Errors from '../core/Errors.js'
import * as errors from '../core/internal/errors.js'
import * as promise from '../core/internal/promise.js'
import { stringify } from '../core/internal/stringify.js'
import type { MaybePromise } from '../core/internal/types.js'

/** A JSON-RPC request body (id/jsonrpc filled in by the client). */
export type RpcRequest = Omit<
  RpcRequest_ox.RpcRequest,
  'id' | 'jsonrpc' | '_returnType'
> & {
  id?: number | undefined
  jsonrpc?: '2.0' | undefined
}

/**
 * A request body's typed response: a single body maps to one response, a batch
 * maps element-wise to a tuple. Results are typed from each method against the
 * `schema` (defaulting to {@link ox#RpcSchema.Default}), falling back to
 * `unknown`.
 */
type ResponsesOf<
  body extends RpcRequest | readonly RpcRequest[],
  schema extends RpcSchema.Generic = RpcSchema.Default,
> = body extends readonly RpcRequest[]
  ? {
      -readonly [index in keyof body]: RpcResponse.RpcResponse<
        RpcSchema.ExtractReturnType<
          schema,
          body[index] extends RpcRequest ? body[index]['method'] : string
        >
      >
    }
  : body extends RpcRequest
    ? RpcResponse.RpcResponse<
        RpcSchema.ExtractReturnType<schema, body['method']>
      >
    : RpcResponse.RpcResponse

/**
 * A JSON-RPC client: executes a request body (single or batch) over an
 * endpoint. Results are typed from each method against the `schema`
 * (mirrors ox `RpcTransport`).
 *
 * The `requestOptions` parameter carries transport-specific per-request options
 * (e.g. `fetchOptions` for HTTP, `timeout` for sockets). The `schema` parameter
 * is the resolved {@link ox#RpcSchema.Generic} used to type request results.
 */
export type RpcClient<
  requestOptions extends object = {},
  schema extends RpcSchema.Generic = RpcSchema.Default,
> = {
  request<const body extends RpcRequest | readonly RpcRequest[]>(
    options: { body: body } & requestOptions,
  ): Promise<ResponsesOf<body, schema>>
}

/**
 * Creates a JSON-RPC client from a low-level `transport` that sends a
 * finalized request body (single or batch) and resolves with the raw
 * response(s).
 *
 * `from` centralizes JSON-RPC envelope finalization: each body is assigned a
 * `jsonrpc: '2.0'` field and an `id` (from `body.id`, else the client's id
 * source) before being handed to `transport.request`.
 */
export function from<
  requestOptions extends object = {},
  schema extends RpcSchema.Schema = RpcSchema.Default,
>(
  transport: from.Transport<requestOptions>,
  options: from.Options<schema> = {},
): RpcClient<requestOptions, RpcSchema.ToGeneric<schema>> {
  const nextId = options.id ?? (() => id++)
  return {
    request(params: { body: RpcRequest | readonly RpcRequest[] }) {
      const { body, ...requestOptions } = params
      const finalized = Array.isArray(body)
        ? body.map((b) => finalize(b, nextId))
        : finalize(body as RpcRequest, nextId)
      return transport.request(
        finalized,
        requestOptions as unknown as requestOptions,
      )
    },
  } as RpcClient<requestOptions, RpcSchema.ToGeneric<schema>>
}

export declare namespace from {
  /** Low-level transport `from` wraps into a typed {@link RpcClient}. */
  type Transport<requestOptions extends object = {}> = {
    request(
      body: RpcRequest | readonly RpcRequest[],
      options: requestOptions,
    ): Promise<RpcResponse.RpcResponse | readonly RpcResponse.RpcResponse[]>
  }

  type Options<schema extends RpcSchema.Schema = RpcSchema.Default> = {
    /** JSON-RPC request id source. @default a monotonic counter */
    id?: (() => number) | undefined
    /**
     * RPC schema used to type request results. Accepts an
     * {@link ox#RpcSchema.Generic} or a Zod namespace (from `ox/zod`).
     */
    schema?: schema | undefined
  }
}

/** Creates an HTTP JSON-RPC client (single + batch bodies). */
export function http<schema extends RpcSchema.Schema = RpcSchema.Default>(
  url_: string,
  options: http.Options<schema> = {},
): RpcClient<http.RequestOptions, RpcSchema.ToGeneric<schema>> {
  const { url, headers: headers_url } = parseUrl(url_)

  return from<http.RequestOptions, schema>({
    async request(body, requestOptions) {
      const errorBody = body as
        | { [x: string]: unknown }
        | { [y: string]: unknown }[]
      const {
        fetchFn = options.fetchFn ?? fetch,
        onRequest = options.onRequest,
        onResponse = options.onResponse,
        timeout = options.timeout ?? 10_000,
      } = options

      const fetchOptions = {
        ...options.fetchOptions,
        ...requestOptions.fetchOptions,
      }
      const { headers, method, signal: signal_ } = fetchOptions

      try {
        const response = await promise.withTimeout(
          async ({ signal }) => {
            const init: RequestInit = {
              ...fetchOptions,
              body: stringify(body),
              headers: {
                ...headers_url,
                'Content-Type': 'application/json',
                ...headers,
              },
              method: method || 'POST',
              signal: signal_ || (timeout > 0 ? signal : null),
            }
            const request = new Request(url, init)
            const overrides = (await onRequest?.(request, init)) ?? {
              ...init,
              url,
            }
            return fetchFn(overrides.url ?? url, overrides)
          },
          {
            errorInstance: new TimeoutError({ body: errorBody, url }),
            timeout,
            signal: true,
          },
        )

        if (onResponse) await onResponse(response)

        let data: any
        if (
          response.headers.get('Content-Type')?.startsWith('application/json')
        )
          data = await response.json()
        else {
          data = await response.text()
          try {
            data = JSON.parse(data || '{}')
          } catch (err) {
            if (response.ok) throw err
            data = { error: data }
          }
        }

        if (!response.ok) {
          // A valid JSON-RPC error body flows through normal error handling.
          if (
            typeof data.error?.code === 'number' &&
            typeof data.error?.message === 'string'
          )
            return data

          throw new HttpError({
            body: errorBody,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url,
          })
        }

        return data
      } catch (err) {
        if (signal_?.aborted) throw errors.getAbortError(signal_)
        if (errors.isAbortError(err)) throw err
        if (err instanceof HttpError) throw err
        if (err instanceof TimeoutError) throw err
        throw new HttpError({ body: errorBody, cause: err as Error, url })
      }
    },
  })
}

export declare namespace http {
  type RequestOptions = {
    /** Request configuration passed to `fetch`. */
    fetchOptions?: Omit<RequestInit, 'body'> | undefined
  }

  type Options<schema extends RpcSchema.Schema = RpcSchema.Default> = {
    /** Override for the `fetch` function. */
    fetchFn?: typeof fetch | undefined
    /** Request configuration passed to `fetch`. */
    fetchOptions?: Omit<RequestInit, 'body'> | undefined
    /** Callback invoked before the request is sent. */
    onRequest?:
      | ((
          request: Request,
          init: RequestInit,
        ) => MaybePromise<void | (RequestInit & { url?: string | undefined })>)
      | undefined
    /** Callback invoked with the raw response. */
    onResponse?: ((response: Response) => MaybePromise<void>) | undefined
    /**
     * RPC schema used to type request results. Accepts an
     * {@link ox#RpcSchema.Generic} or a Zod namespace (from `ox/zod`).
     */
    schema?: schema | undefined
    /** Timeout (in ms) for the request. @default 10_000 */
    timeout?: number | undefined
  }
}

/** A JSON-RPC response received over a socket (incl. subscription notifications). */
type Id = string | number

/** The minimal reconnecting connection a {@link Socket} client drives. */
export type Connection = {
  /** Underlying socket ready state, if exposed. */
  readyState?: number | undefined
  send(data: string): void
  close(): void
}

export declare namespace Connection {
  /** Handlers wired by {@link fromSocket} to the underlying connection. */
  type Handlers = {
    onClose: () => void
    onError: (error: Error | Event) => void
    onOpen: () => void
    onResponse: (response: Socket.Response) => void
  }
}

/** Factory that constructs a reconnecting {@link Connection} wired to `handlers`. */
export type CreateConnection<connection extends Connection = Connection> = (
  handlers: Connection.Handlers,
) => connection | Promise<connection>

/** Whether to send keep-alive messages over the socket. */
export type KeepAlive =
  | boolean
  | {
      /** Interval (in ms) between keep-alive messages. @default 30_000 */
      interval?: number | undefined
    }
  | undefined

/**
 * A JSON-RPC client over a long-lived (reconnecting) socket. Extends
 * {@link RpcClient} with socket lifecycle (`close`/`socket`) and
 * subscriptions, and accepts a per-request `timeout`.
 */
export type Socket<
  connection extends Connection = Connection,
  schema extends RpcSchema.Generic = RpcSchema.Default,
> = RpcClient<Socket.RequestOptions, schema> & {
  /** Intentionally and permanently close the socket. */
  close(): void
  /** The underlying connection. */
  get socket(): connection
  /** Subscribes to a JSON-RPC subscription (`eth_subscribe`). */
  subscribe(
    options: Socket.subscribe.Options,
  ): Promise<Socket.subscribe.ReturnType>
  /** In-flight (non-subscription) requests, keyed by id. */
  requests: Map<Id, Socket.Callback>
  /** Active subscriptions, keyed by subscription id. */
  subscriptions: Map<Id, Socket.Callback>
  /** Endpoint URL (or IPC path). */
  url: string
}

export declare namespace Socket {
  type RequestOptions = {
    /** Timeout (in ms) for the request. @default 10_000 */
    timeout?: number | undefined
  }

  type Response<result = unknown> = RpcResponse.RpcResponse<result> & {
    method?: string | undefined
    params?:
      | {
          subscription?: string | undefined
          result?: unknown
        }
      | undefined
  }

  type Callback = {
    body?: RpcRequest | undefined
    onError?: ((error: Error | Event) => void) | undefined
    onResponse: (response: Response) => void
  }

  namespace subscribe {
    type Data = { subscription: Hex.Hex; result: unknown }

    type LogsFilter = {
      address?: Address.Address | readonly Address.Address[] | undefined
      topics?: readonly (Hex.Hex | readonly Hex.Hex[] | null)[] | undefined
    }

    type Options =
      | { params: ['newHeads'] }
      | { params: ['newPendingTransactions'] }
      | { params: ['logs', LogsFilter] }
      | { params: ['syncing'] }

    type ReturnType = {
      subscriptionId: Hex.Hex
      /** Registers a listener invoked with each subscription notification. */
      onData(listener: (data: Data) => void): void
      /** Registers a listener invoked when the subscription errors. */
      onError(listener: (error: Error | Event) => void): void
      unsubscribe(): Promise<RpcResponse.RpcResponse<boolean>>
    }

    type Fn = (options: Options) => Promise<ReturnType>
  }
}

/** Cache of live socket clients, keyed by `cacheKey`. @internal */
const socketClientCache = /*#__PURE__*/ new Map<string, Socket<Connection>>()

/**
 * Creates (or returns a cached) JSON-RPC {@link Socket} client over a
 * reconnecting {@link Connection}. Built on {@link from}: the public async
 * `request` shares a single id source with the socket's subscription machinery,
 * so generated ids never collide.
 */
export async function fromSocket<
  connection extends Connection,
  schema extends RpcSchema.Schema = RpcSchema.Default,
>(
  options: fromSocket.Options<connection, schema>,
): Promise<Socket<connection, RpcSchema.ToGeneric<schema>>> {
  const {
    cacheKey,
    createConnection,
    keepAlive = true,
    reconnect = true,
    url,
  } = options
  const { interval: keepAliveInterval = 30_000 } =
    typeof keepAlive === 'object' ? keepAlive : {}

  type Result = Socket<connection, RpcSchema.ToGeneric<schema>>

  const cached = socketClientCache.get(cacheKey)
  if (cached) return cached as {} as Result

  const { schedule } = promise.createBatchScheduler<
    undefined,
    [Socket<connection>]
  >({
    id: cacheKey,
    fn: async () => {
      // Cache for "synchronous" requests, keyed by request id.
      const requests: Map<Id, Socket.Callback> = new Map()
      // Cache for subscriptions, keyed by subscription id.
      const subscriptions: Map<Id, Socket.Callback> = new Map()

      let id = 0
      const nextId = () => id++

      let error: Error | Event | undefined
      let opened = false
      let keepAliveTimer: ReturnType<typeof setInterval> | undefined

      /**
       * Low-level callback-style request primitive. Returns a cleanup that
       * removes the pending request (used to clear it on timeout).
       */
      function requestInternal(
        callback: Socket.Callback & { body: RpcRequest },
      ) {
        const { body, onError, onResponse } = callback
        if (error) {
          onError?.(error)
          return () => {}
        }

        const request = finalize(body, nextId)
        const { id } = request

        const onResponse_ = (response: Socket.Response) => {
          // Register a subscription listener for incoming notifications.
          if (
            body.method === 'eth_subscribe' &&
            typeof response.result === 'string'
          )
            subscriptions.set(response.result, {
              body,
              onError,
              onResponse: onResponse_,
            })

          onResponse(response)
        }

        // Remove the listener immediately so it is not resubscribed.
        if (body.method === 'eth_unsubscribe')
          subscriptions.delete((body.params as Id[] | undefined)?.[0] as Id)

        requests.set(id, { onError, onResponse: onResponse_ })
        connection.send(stringify(request))

        return () => requests.delete(id)
      }

      function requestOne(body: RpcRequest, timeout: number) {
        let cleanup: (() => void) | undefined
        return promise
          .withTimeout(
            () =>
              new Promise<Socket.Response>((onResponse, onError) => {
                cleanup = requestInternal({ body, onError, onResponse })
              }),
            {
              errorInstance: new TimeoutError({
                body: body as { [x: string]: unknown },
                url,
              }),
              timeout,
            },
          )
          .finally(() => cleanup?.())
      }

      const client = from<Socket.RequestOptions>(
        {
          request(body, requestOptions) {
            const { timeout = 10_000 } = requestOptions
            if (Array.isArray(body))
              return Promise.all(body.map((b) => requestOne(b, timeout)))
            return requestOne(body as RpcRequest, timeout)
          },
        },
        { id: nextId },
      )

      function subscribe(
        subscribeOptions: Socket.subscribe.Options,
      ): Promise<Socket.subscribe.ReturnType> {
        const { params } = subscribeOptions

        // Buffer notifications/errors that arrive before a listener attaches
        // (e.g. an ack and its first notification in the same socket frame),
        // then flush them once `onData`/`onError` are registered.
        let onDataFn: ((data: Socket.subscribe.Data) => void) | undefined
        let onErrorFn: ((error: Error | Event) => void) | undefined
        const dataQueue: Socket.subscribe.Data[] = []
        const errorQueue: (Error | Event)[] = []

        const emitData = (data: Socket.subscribe.Data) => {
          if (onDataFn) onDataFn(data)
          else dataQueue.push(data)
        }
        const emitError = (error: Error | Event) => {
          if (onErrorFn) onErrorFn(error)
          else errorQueue.push(error)
        }

        return new Promise<Socket.subscribe.ReturnType>((resolve, reject) => {
          requestInternal({
            body: { method: 'eth_subscribe', params },
            onError(error) {
              reject(error)
              emitError(error)
            },
            onResponse(response) {
              if (response.error) {
                const error = RpcResponse.parseError(response.error)
                reject(error)
                emitError(error)
                return
              }
              if (typeof response.id === 'number') {
                const subscriptionId = response.result as Hex.Hex
                resolve({
                  subscriptionId,
                  onData(listener) {
                    onDataFn = listener
                    while (dataQueue.length) listener(dataQueue.shift()!)
                  },
                  onError(listener) {
                    onErrorFn = listener
                    while (errorQueue.length) listener(errorQueue.shift()!)
                  },
                  unsubscribe() {
                    return new Promise<Socket.Response>((resolve) =>
                      requestInternal({
                        body: {
                          method: 'eth_unsubscribe',
                          params: [subscriptionId],
                        },
                        onResponse: resolve,
                      }),
                    ) as Promise<RpcResponse.RpcResponse<boolean>>
                  },
                })
                return
              }
              emitData(response.params as Socket.subscribe.Data)
            },
          })
        })
      }

      const connection = await createConnection({
        onClose() {
          // Notify (and clear) all in-flight requests of the closure.
          for (const request of requests.values())
            request.onError?.(new SocketClosedError({ url }))
          requests.clear()

          // Notify active subscriptions; keep them for resubscribe unless the
          // socket will not reconnect.
          for (const subscription of subscriptions.values())
            subscription.onError?.(new SocketClosedError({ url }))
          if (!reconnect) subscriptions.clear()
        },
        onError(error_) {
          // The socket dispatches `close` before `error`, so in-flight requests
          // and subscriptions are already notified by `onClose`. Retain the
          // error so a subsequent request can surface it immediately.
          error = error_
        },
        onOpen() {
          error = undefined

          // On a reconnect, resubscribe active subscriptions.
          if (opened) {
            for (const [key, { body, onError, onResponse }] of subscriptions) {
              subscriptions.delete(key)
              requestInternal({ body: body as RpcRequest, onError, onResponse })
            }
          }

          opened = true
        },
        onResponse(data) {
          const isSubscription = data.method === 'eth_subscription'
          const id = isSubscription ? data.params?.subscription : data.id
          const cache = isSubscription ? subscriptions : requests
          const callback = cache.get(id as Id)
          callback?.onResponse(data)
          if (!isSubscription) cache.delete(id as Id)
        },
      })

      if (keepAlive)
        keepAliveTimer = setInterval(() => {
          connection.send(
            stringify({
              jsonrpc: '2.0',
              id: null,
              method: 'net_version',
              params: [],
            }),
          )
        }, keepAliveInterval)

      const socketClient: Socket<connection> = {
        request: client.request,
        close() {
          if (keepAliveTimer) clearInterval(keepAliveTimer)
          connection.close()
          socketClientCache.delete(cacheKey)
        },
        get socket() {
          return connection
        },
        subscribe,
        requests,
        subscriptions,
        url,
      }
      socketClientCache.set(cacheKey, socketClient as {} as Socket<Connection>)

      return [socketClient]
    },
  })

  const [, [socketClient]] = await schedule(undefined)
  return socketClient as {} as Result
}

export declare namespace fromSocket {
  type Options<
    connection extends Connection = Connection,
    schema extends RpcSchema.Schema = RpcSchema.Default,
  > = {
    /** Cache key uniquely identifying the socket client. */
    cacheKey: string
    /** Factory constructing the reconnecting connection. */
    createConnection: CreateConnection<connection>
    /** Whether to send keep-alive messages. @default true */
    keepAlive?: KeepAlive | undefined
    /** Whether to keep + resubscribe subscriptions across reconnects. @default true */
    reconnect?: boolean | undefined
    /**
     * RPC schema used to type request results. Accepts an
     * {@link ox#RpcSchema.Generic} or a Zod namespace (from `ox/zod`).
     */
    schema?: schema | undefined
    /** Endpoint URL (or IPC path). */
    url: string
  }
}

/**
 * Creates (or returns a cached) JSON-RPC {@link Socket} client over a
 * reconnecting WebSocket. Built on {@link fromSocket}.
 */
export function webSocket<schema extends RpcSchema.Schema = RpcSchema.Default>(
  url: string,
  options: webSocket.Options<schema> = {},
): Promise<Socket<ReconnectingWebSocket, RpcSchema.ToGeneric<schema>>> {
  const { keepAlive = true, reconnect = true } = options

  const rwsOptions = (() => {
    if (reconnect === false) return { maxRetries: 0 }
    if (reconnect === true) return {}
    return reconnect
  })() as ConstructorParameters<typeof ReconnectingWebSocket>[2]

  return fromSocket<ReconnectingWebSocket, schema>({
    cacheKey: stringify({ type: 'webSocket', url, keepAlive, reconnect }),
    createConnection({ onClose, onError, onOpen, onResponse }) {
      const ws = new ReconnectingWebSocket(url, undefined, rwsOptions)
      const target = ws as unknown as {
        addEventListener(type: string, listener: (event: any) => void): void
      }
      target.addEventListener('open', () => onOpen())
      target.addEventListener('close', () => onClose())
      target.addEventListener('error', (event) => onError(event.error))
      target.addEventListener('message', (event) => {
        const { data } = event
        // Ignore empty keep-alive frames.
        if (typeof data === 'string' && data.trim().length === 0) return
        try {
          onResponse(JSON.parse(data as string))
        } catch (error) {
          onError(error as Error)
        }
      })
      return ws
    },
    keepAlive,
    reconnect: reconnect !== false,
    url,
  })
}

export declare namespace webSocket {
  /** Reconnection options (forwarded to the reconnecting socket). */
  type ReconnectOptions = {
    /** Max reconnection attempts. @default Infinity */
    maxRetries?: number | undefined
    /** Min delay (ms) before a reconnection attempt. @default 3_000 */
    minReconnectionDelay?: number | undefined
    /** Max delay (ms) before a reconnection attempt. @default 10_000 */
    maxReconnectionDelay?: number | undefined
    /** Exponential backoff growth factor. @default 1.3 */
    reconnectionDelayGrowFactor?: number | undefined
    /** Uptime (ms) before the retry counter resets. @default 5_000 */
    minUptime?: number | undefined
    /** Timeout (ms) for a single connection attempt. @default 4_000 */
    connectionTimeout?: number | undefined
    /** Max messages buffered while disconnected. @default Infinity */
    maxEnqueuedMessages?: number | undefined
  }

  type Options<schema extends RpcSchema.Schema = RpcSchema.Default> = {
    /** Whether to send keep-alive messages. @default true */
    keepAlive?: KeepAlive | undefined
    /** Whether (and how) to reconnect on socket closure. @default true */
    reconnect?: boolean | ReconnectOptions | undefined
    /**
     * RPC schema used to type request results. Accepts an
     * {@link ox#RpcSchema.Generic} or a Zod namespace (from `ox/zod`).
     */
    schema?: schema | undefined
  }
}

/** Monotonic JSON-RPC request id source. @internal */
let id = 0

/** Finalizes a request body with a `jsonrpc` field and an `id`. */
function finalize(body: RpcRequest, nextId: () => number) {
  const { id, jsonrpc: _jsonrpc, ...rest } = body
  return { jsonrpc: '2.0' as const, id: id ?? nextId(), ...rest }
}

/** Parses Basic-auth credentials out of a URL into an `Authorization` header. */
function parseUrl(url_: string): {
  url: string
  headers?: Record<string, string> | undefined
} {
  try {
    const url = new URL(url_)
    if (url.username) {
      const credentials = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
      url.username = ''
      url.password = ''
      return {
        url: url.toString(),
        headers: { Authorization: `Basic ${btoa(credentials)}` },
      }
    }
    return { url: url.toString() }
  } catch {
    return { url: url_ }
  }
}

/** Thrown when an HTTP request fails. */
export class HttpError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'RpcClient.HttpError'

  body?: { [x: string]: unknown } | { [y: string]: unknown }[] | undefined
  headers?: Headers | undefined
  status?: number | undefined
  url: string

  constructor({
    body,
    cause,
    details,
    headers,
    status,
    url,
  }: {
    body?: { [x: string]: unknown } | { [y: string]: unknown }[] | undefined
    cause?: Error | undefined
    details?: string | undefined
    headers?: Headers | undefined
    status?: number | undefined
    url: string
  }) {
    super('HTTP request failed.', {
      cause,
      details,
      metaMessages: [
        status && `Status: ${status}`,
        `URL: ${url}`,
        body && `Request body: ${stringify(body)}`,
      ].filter(Boolean) as string[],
    })
    this.body = body
    this.headers = headers
    this.status = status
    this.url = url
  }
}

/** Thrown when the socket closed while requests were in flight. */
export class SocketClosedError extends Errors.BaseError {
  override readonly name = 'RpcClient.SocketClosedError'

  url?: string | undefined

  constructor({ url }: { url?: string | undefined } = {}) {
    super('The socket has been closed.', {
      metaMessages: [url && `URL: ${url}`].filter(Boolean) as string[],
    })
    this.url = url
  }
}

/** Thrown when a request takes longer than the configured timeout. */
export class TimeoutError extends Errors.BaseError {
  override readonly name = 'RpcClient.TimeoutError'

  url: string

  constructor({
    body,
    url,
  }: {
    body: { [x: string]: unknown } | { [y: string]: unknown }[]
    url: string
  }) {
    super('The request took too long to respond.', {
      details: 'The request timed out.',
      metaMessages: [`URL: ${url}`, `Request body: ${stringify(body)}`],
    })
    this.url = url
  }
}
