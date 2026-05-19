import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import type * as RpcResponse from 'ox/RpcResponse'

import * as Transport from '../Transport.js'
import {
  RpcRequestError,
  SocketClosedError,
  TimeoutError,
  WebSocketRequestError,
} from '../internal/request.js'
import { stringify } from '../internal/stringify.js'
import { withTimeout } from '../internal/promise.js'

type JsonRpcRequest = {
  id?: number | undefined
  jsonrpc?: '2.0' | undefined
  method: string
  params?: unknown | undefined
}

type JsonRpcResponse = RpcResponse.RpcResponse

let id = 0
const socketClientCache = new Map<string, Promise<SocketRpcClient>>()

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

function withJsonRpcProperties(body: JsonRpcRequest) {
  return {
    ...body,
    jsonrpc: '2.0' as const,
    id: body.id ?? id++,
  }
}
