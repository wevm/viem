import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import type * as RpcResponse from 'ox/RpcResponse'
import type * as RpcSchema from 'ox/RpcSchema'

import type * as Chain from './Chain.js'
import * as Transport from './Transport.js'
import { getAbortError, isAbortError } from './internal/errors.js'
import { createBatchScheduler, withTimeout } from './internal/promise.js'
import {
  HttpRequestError,
  RpcRequestError,
  SocketClosedError,
  TimeoutError,
  WebSocketRequestError,
} from './internal/request.js'
import { stringify } from './internal/stringify.js'
import { wait } from './internal/wait.js'

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
const socketClientCache = new Map<string, Promise<SocketRpcClient>>()

/** Creates a HTTP JSON-RPC transport. */
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
  type Options<
    schema extends RpcSchema.Generic | undefined = undefined,
    raw extends boolean = false,
  > = {
    /** Enables JSON-RPC batching. */
    batch?:
      | boolean
      | {
          batchSize?: number | undefined
          wait?: number | undefined
        }
      | undefined
    /** Fetch implementation. */
    fetchFn?: HttpRpcClientOptions['fetchFn'] | undefined
    /** Fetch options. */
    fetchOptions?: HttpRpcClientOptions['fetchOptions'] | undefined
    /** Request hook. */
    onFetchRequest?: HttpRpcClientOptions['onRequest'] | undefined
    /** Response hook. */
    onFetchResponse?: HttpRpcClientOptions['onResponse'] | undefined
    key?: string | undefined
    methods?: Transport.Methods | undefined
    name?: string | undefined
    /** Returns raw JSON-RPC `{ error, result }` responses. */
    raw?: raw | boolean | undefined
    retryCount?: number | undefined
    retryDelay?: number | undefined
    /** Typed JSON-RPC schema. */
    rpcSchema?: schema | RpcSchema.Generic | undefined
    /** Request timeout in milliseconds. */
    timeout?: number | undefined
  }

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

/** Creates an EIP-1193 provider transport. */
export function custom<provider extends custom.Provider>(
  provider: provider,
  options: custom.Options = {},
): custom.Transport {
  const {
    key = 'custom',
    methods,
    name = 'Custom Provider',
    retryDelay,
  } = options
  return ({ retryCount: retryCount_ }) =>
    Transport.create({
      key,
      methods,
      name,
      request: provider.request.bind(provider) as Transport.AnyRequestFn,
      retryCount: options.retryCount ?? retryCount_,
      retryDelay,
      type: 'custom',
    })
}

export declare namespace custom {
  type Provider = {
    request(args: {
      method: string
      params?: unknown | undefined
    }): Promise<unknown>
  }

  type Options = {
    key?: string | undefined
    methods?: Transport.Methods | undefined
    name?: string | undefined
    retryCount?: number | undefined
    retryDelay?: number | undefined
  }

  type Transport = Transport.Transport<'custom', {}, Provider['request']>
}

/** Creates a fallback transport. */
export function fallback<
  const transports extends readonly Transport.Transport[],
>(
  transports_: transports,
  options: fallback.Options = {},
): fallback.Transport<transports> {
  const {
    key = 'fallback',
    name = 'Fallback',
    rank = false,
    retryCount,
    retryDelay,
    shouldThrow = Transport.shouldThrow,
  } = options

  return (({ chain, pollingInterval = 4_000, timeout, ...rest }) => {
    let transports = transports_
    let onResponse: fallback.OnResponse = () => undefined

    const transport = Transport.create(
      {
        key,
        name,
        async request({ method, params }) {
          let includes: boolean | undefined

          const fetch = async (index = 0): Promise<unknown> => {
            const transport = transports[index]?.({
              ...rest,
              chain,
              retryCount: 0,
              timeout,
            })
            if (!transport) return undefined

            try {
              const response = await transport.request({
                method,
                params,
              } as Transport.Request)
              onResponse({
                method,
                params: params as unknown[],
                response,
                status: 'success',
                transport,
              })
              return response
            } catch (error) {
              onResponse({
                error: error as Error,
                method,
                params: params as unknown[],
                status: 'error',
                transport,
              })

              if (shouldThrow(error as Error)) throw error
              if (index === transports.length - 1) throw error

              includes ??= transports.slice(index + 1).some((transport_) => {
                const { exclude, include } =
                  transport_({ chain }).config.methods ?? {}
                if (include) return include.includes(method)
                if (exclude) return !exclude.includes(method)
                return true
              })
              if (!includes) throw error
              return fetch(index + 1)
            }
          }

          return fetch()
        },
        retryCount,
        retryDelay,
        type: 'fallback',
      },
      {
        onResponse: (fn: fallback.OnResponse) => {
          onResponse = fn
        },
        transports: transports.map((transport) =>
          transport({ chain, retryCount: 0 }),
        ),
      },
    )

    if (rank) {
      const rankOptions = typeof rank === 'object' ? rank : {}
      rankTransports({
        chain,
        interval: rankOptions.interval ?? pollingInterval,
        onTransports: (transports_) => {
          transports = transports_ as transports
        },
        ping: rankOptions.ping,
        sampleCount: rankOptions.sampleCount,
        timeout: rankOptions.timeout,
        transports,
        weights: rankOptions.weights,
      })
    }

    return transport
  }) as fallback.Transport<transports>
}

export declare namespace fallback {
  type Options = {
    key?: string | undefined
    name?: string | undefined
    rank?: boolean | RankOptions | undefined
    retryCount?: number | undefined
    retryDelay?: number | undefined
    shouldThrow?: ((error: Error) => boolean) | undefined
  }

  type OnResponse = (
    args: {
      method: string
      params: unknown[]
      transport: Transport.Instance
    } & (
      | {
          error?: undefined
          response: unknown
          status: 'success'
        }
      | {
          error: Error
          response?: undefined
          status: 'error'
        }
    ),
  ) => void

  type Transport<transports extends readonly Transport.Transport[]> =
    Transport.Transport<
      'fallback',
      {
        onResponse: (fn: OnResponse) => void
        transports: {
          [key in keyof transports]: ReturnType<transports[key]>
        }
      }
    >
}

/** Creates a WebSocket JSON-RPC transport. */
export function webSocket(
  url?: string | undefined,
  options: webSocket.Options = {},
): webSocket.Transport {
  const {
    keepAlive,
    key = 'webSocket',
    methods,
    name = 'WebSocket JSON-RPC',
    reconnect,
    retryDelay,
  } = options

  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const retryCount = options.retryCount ?? retryCount_
    const timeout = timeout_ ?? options.timeout ?? 10_000
    const url_ = url ?? chain?.rpcUrls.default.webSocket?.[0]
    if (!url_) throw new Transport.UrlRequiredError()

    return Transport.create(
      {
        key,
        methods,
        name,
        async request({ method, params }) {
          const body = { method, params }
          const rpcClient = await getWebSocketRpcClient(url_, {
            keepAlive,
            reconnect,
          })
          const { error, result } = await rpcClient.requestAsync({
            body,
            timeout,
          })
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
        type: 'webSocket',
      },
      {
        getRpcClient() {
          return getWebSocketRpcClient(url_, { keepAlive, reconnect })
        },
        async subscribe({ onData, onError, params }) {
          const rpcClient = await getWebSocketRpcClient(url_, {
            keepAlive,
            reconnect,
          })
          return rpcClient.subscribe({ onData, onError, params })
        },
      },
    )
  }
}

export declare namespace webSocket {
  type Options = {
    keepAlive?: SocketOptions['keepAlive'] | undefined
    key?: string | undefined
    methods?: Transport.Methods | undefined
    name?: string | undefined
    reconnect?: SocketOptions['reconnect'] | undefined
    retryCount?: number | undefined
    retryDelay?: number | undefined
    timeout?: number | undefined
  }

  type Transport = Transport.Transport<
    'webSocket',
    {
      getRpcClient(): Promise<SocketRpcClient>
      subscribe: WebSocketSubscribe
    }
  >
}

type RankOptions = {
  interval?: number | undefined
  ping?:
    | ((options: { transport: Transport.Instance }) => Promise<unknown>)
    | undefined
  sampleCount?: number | undefined
  timeout?: number | undefined
  weights?:
    | {
        latency?: number | undefined
        stability?: number | undefined
      }
    | undefined
}

/* c8 ignore start */
function rankTransports(options: {
  chain?: Chain.Chain | undefined
  interval: number | undefined
  onTransports: (transports: readonly Transport.Transport[]) => void
  ping?: RankOptions['ping'] | undefined
  sampleCount?: number | undefined
  timeout?: number | undefined
  transports: readonly Transport.Transport[]
  weights?: RankOptions['weights'] | undefined
}) {
  const {
    chain,
    interval = 4_000,
    onTransports,
    ping,
    sampleCount = 10,
    timeout = 1_000,
    transports,
    weights = {},
  } = options
  const { latency: latencyWeight = 0.3, stability: stabilityWeight = 0.7 } =
    weights
  const samples: { latency: number; success: number }[][] = []

  const rank = async () => {
    const sample = await Promise.all(
      transports.map(async (transport) => {
        const transport_ = transport({ chain, retryCount: 0, timeout })
        const start = Date.now()
        try {
          await (ping
            ? ping({ transport: transport_ })
            : transport_.request({
                method: 'net_listening',
              } as Transport.Request))
          return { latency: Date.now() - start, success: 1 }
        } catch {
          return { latency: Date.now() - start, success: 0 }
        }
      }),
    )

    samples.push(sample)
    if (samples.length > sampleCount) samples.shift()

    const maxLatency = Math.max(
      ...samples.map((sample) =>
        Math.max(...sample.map(({ latency }) => latency)),
      ),
    )
    const scores = transports
      .map((_, index) => {
        const latencies = samples.map((sample) => sample[index]!.latency)
        const meanLatency =
          latencies.reduce((total, latency) => total + latency, 0) /
          latencies.length
        const latencyScore = maxLatency === 0 ? 1 : 1 - meanLatency / maxLatency
        const successes = samples.map((sample) => sample[index]!.success)
        const stabilityScore =
          successes.reduce((total, success) => total + success, 0) /
          successes.length
        if (stabilityScore === 0) return [0, index] as const
        return [
          latencyWeight * latencyScore + stabilityWeight * stabilityScore,
          index,
        ] as const
      })
      .sort((a, b) => b[0] - a[0])

    onTransports(scores.map(([, index]) => transports[index]!))
    await wait(interval ?? 4_000)
    /* c8 ignore next 2 */
    rank()
  }

  rank()
}
/* c8 ignore stop */

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

type SocketOptions = {
  keepAlive?:
    | boolean
    | {
        interval?: number | undefined
      }
    | undefined
  reconnect?:
    | boolean
    | {
        attempts?: number | undefined
        delay?: number | undefined
      }
    | undefined
}

type SocketRpcClient = {
  close(): void
  request(options: {
    body: JsonRpcRequest
    onError?: ((error: Error | Event | undefined) => void) | undefined
    onResponse: (response: JsonRpcResponse) => void
  }): void
  requestAsync(options: {
    body: JsonRpcRequest
    timeout?: number | undefined
  }): Promise<JsonRpcResponse>
  subscribe: WebSocketSubscribe
  url: string
}

type WebSocketSubscribe = (options: {
  onData: (data: unknown) => void
  onError?: ((error: Error | Event | undefined) => void) | undefined
  params:
    | ['newHeads']
    | ['newPendingTransactions']
    | [
        'logs',
        { address?: Address.Address | Address.Address[]; topics?: Hex.Hex[] },
      ]
    | ['syncing']
}) => Promise<{
  subscriptionId: Hex.Hex
  unsubscribe: () => Promise<JsonRpcResponse>
}>

async function getWebSocketRpcClient(
  url: string,
  options: SocketOptions = {},
): Promise<SocketRpcClient> {
  const id = JSON.stringify({ options, url })
  const cached = socketClientCache.get(id)
  if (cached) return cached
  const promise = createWebSocketRpcClient(url, options)
  socketClientCache.set(id, promise)
  return promise
}

async function createWebSocketRpcClient(
  url: string,
  options: SocketOptions,
): Promise<SocketRpcClient> {
  const { keepAlive = true } = options
  const { interval = 30_000 } = typeof keepAlive === 'object' ? keepAlive : {}
  const { WebSocket } = await import('isows')
  const socket = new WebSocket(url)
  const requests = new Map<
    number,
    {
      onError?: ((error: Error | Event | undefined) => void) | undefined
      onResponse: (response: JsonRpcResponse) => void
    }
  >()
  const subscriptions = new Map<
    string,
    {
      onError?: ((error: Error | Event | undefined) => void) | undefined
      onResponse: (response: JsonRpcResponse) => void
    }
  >()
  let keepAliveTimer: ReturnType<typeof setInterval> | undefined

  await new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve(), { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  const onError = (error: Error | Event | undefined) => {
    for (const request of requests.values()) request.onError?.(error)
    for (const subscription of subscriptions.values())
      subscription.onError?.(error)
  }

  socket.addEventListener('close', () =>
    onError(new SocketClosedError({ url })),
  )
  /* c8 ignore next */
  socket.addEventListener('error', (error) => onError(error))
  socket.addEventListener('message', ({ data }) => {
    if (typeof data === 'string' && data.trim().length === 0) return
    try {
      const response = JSON.parse(String(data)) as JsonRpcResponse & {
        method?: string | undefined
        params?: { subscription?: string | undefined } | undefined
      }
      if (response.method === 'eth_subscription') {
        const subscriptionId = response.params?.subscription
        if (!subscriptionId) return
        subscriptions.get(subscriptionId)?.onResponse(response)
        return
      }
      requests.get(response.id)?.onResponse(response)
      requests.delete(response.id)
    } catch (error) {
      /* c8 ignore next */
      onError(error as Error)
    }
  })

  /* c8 ignore start */
  if (keepAlive)
    keepAliveTimer = setInterval(() => {
      if (socket.readyState === socket.OPEN)
        socket.send(
          stringify({
            jsonrpc: '2.0',
            id: id++,
            method: 'net_version',
            params: [],
          }),
        )
    }, interval)
  /* c8 ignore stop */

  const client: SocketRpcClient = {
    close() {
      if (keepAliveTimer) clearInterval(keepAliveTimer)
      socket.close()
      socketClientCache.delete(JSON.stringify({ options, url }))
    },
    request({ body, onError, onResponse }) {
      if (
        socket.readyState === socket.CLOSED ||
        socket.readyState === socket.CLOSING
      )
        throw new WebSocketRequestError({
          body,
          cause: new SocketClosedError({ url }),
          url,
        })

      const request = withJsonRpcProperties(body)
      requests.set(request.id, { onError, onResponse })
      socket.send(stringify(request))
    },
    requestAsync({ body, timeout = 10_000 }) {
      return withTimeout(
        () =>
          new Promise<JsonRpcResponse>((resolve, reject) =>
            client.request({
              body,
              onError: (error) => reject(error),
              onResponse: resolve,
            }),
          ),
        {
          errorInstance: new TimeoutError({ body, url }),
          timeout,
        },
      )
    },
    async subscribe({ onData, onError, params }) {
      const response = await new Promise<JsonRpcResponse>((resolve, reject) =>
        client.request({
          body: {
            method: 'eth_subscribe',
            params,
          },
          onError(error) {
            onError?.(error)
            reject(error)
          },
          onResponse(response) {
            if (response.error) {
              onError?.(new Error(response.error.message))
              reject(response.error)
              return
            }
            resolve(response)
          },
        }),
      )
      const subscriptionId = response.result as Hex.Hex
      subscriptions.set(subscriptionId, {
        onError,
        onResponse: (response) =>
          onData((response as unknown as { params: unknown }).params),
      })
      return {
        subscriptionId,
        unsubscribe: () =>
          client.requestAsync({
            body: {
              method: 'eth_unsubscribe',
              params: [subscriptionId],
            },
          }),
      }
    },
    url,
  }
  return client
}
