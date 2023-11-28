import { WebSocket } from 'isows'
import type { MessageEvent } from 'isows'

import {
  HttpRequestError,
  type HttpRequestErrorType,
  TimeoutError,
  type TimeoutErrorType,
  WebSocketRequestError,
} from '../errors/request.js'
import type { ErrorType } from '../errors/utils.js'
import {
  type CreateBatchSchedulerErrorType,
  createBatchScheduler,
} from './promise/createBatchScheduler.js'
import {
  type WithTimeoutErrorType,
  withTimeout,
} from './promise/withTimeout.js'
import { stringify } from './stringify.js'

let id = 0

type SuccessResult<T> = {
  method?: never
  result: T
  error?: never
}
type ErrorResult<T> = {
  method?: never
  result?: never
  error: T
}
type Subscription<TResult, TError> = {
  method: 'eth_subscription'
  error?: never
  result?: never
  params: {
    subscription: string
  } & (
    | {
        result: TResult
        error?: never
      }
    | {
        result?: never
        error: TError
      }
  )
}

export type RpcRequest = { method: string; params?: any; id?: number }

export type RpcResponse<TResult = any, TError = any> = {
  jsonrpc: `${number}`
  id: number
} & (
  | SuccessResult<TResult>
  | ErrorResult<TError>
  | Subscription<TResult, TError>
)

///////////////////////////////////////////////////
// HTTP

export type HttpOptions<TBody extends RpcRequest | RpcRequest[] = RpcRequest> =
  {
    // The RPC request body.
    body: TBody
    // Request configuration to pass to `fetch`.
    fetchOptions?: Omit<RequestInit, 'body'>
    // The timeout (in ms) for the request.
    timeout?: number
  }

export type HttpReturnType<
  TBody extends RpcRequest | RpcRequest[] = RpcRequest,
> = TBody extends RpcRequest[] ? RpcResponse[] : RpcResponse

export type HttpErrorType =
  | HttpRequestErrorType
  | TimeoutErrorType
  | WithTimeoutErrorType
  | ErrorType

async function http<TBody extends RpcRequest | RpcRequest[]>(
  url: string,
  { body, fetchOptions = {}, timeout = 10_000 }: HttpOptions<TBody>,
): Promise<HttpReturnType<TBody>> {
  const { headers, method, signal: signal_ } = fetchOptions
  try {
    const response = await withTimeout(
      async ({ signal }) => {
        const response = await fetch(url, {
          ...fetchOptions,
          body: Array.isArray(body)
            ? stringify(
                body.map((body) => ({
                  jsonrpc: '2.0',
                  id: body.id ?? id++,
                  ...body,
                })),
              )
            : stringify({ jsonrpc: '2.0', id: body.id ?? id++, ...body }),
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          method: method || 'POST',
          signal: signal_ || (timeout > 0 ? signal : undefined),
        })
        return response
      },
      {
        errorInstance: new TimeoutError({ body, url }),
        timeout,
        signal: true,
      },
    )

    let data
    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      throw new HttpRequestError({
        body,
        details: stringify(data.error) || response.statusText,
        headers: response.headers,
        status: response.status,
        url,
      })
    }

    return data
  } catch (err) {
    if (err instanceof HttpRequestError) throw err
    if (err instanceof TimeoutError) throw err
    throw new HttpRequestError({
      body,
      details: (err as Error).message,
      url,
    })
  }
}

///////////////////////////////////////////////////
// WebSocket

type Id = string | number
type CallbackFn = (message: any) => void
type CallbackMap = Map<Id, CallbackFn>

export type Socket = WebSocket & {
  requests: CallbackMap
  subscriptions: CallbackMap
}

export type GetSocketErrorType = CreateBatchSchedulerErrorType | ErrorType

export const socketsCache = /*#__PURE__*/ new Map<string, Socket>()

export async function getSocket(url: string) {
  let socket = socketsCache.get(url)

  // If the socket already exists, return it.
  if (socket) return socket

  const { schedule } = createBatchScheduler<undefined, [Socket]>({
    id: url,
    fn: async () => {
      const webSocket = new WebSocket(url)

      // Set up a cache for incoming "synchronous" requests.
      const requests = new Map<Id, CallbackFn>()

      // Set up a cache for subscriptions (eth_subscribe).
      const subscriptions = new Map<Id, CallbackFn>()

      const onMessage: (event: MessageEvent) => void = ({ data }) => {
        const message: RpcResponse = JSON.parse(data as string)
        const isSubscription = message.method === 'eth_subscription'
        const id = isSubscription ? message.params.subscription : message.id
        const cache = isSubscription ? subscriptions : requests
        const callback = cache.get(id)
        if (callback) callback({ data })
        if (!isSubscription) cache.delete(id)
      }
      const onClose = () => {
        socketsCache.delete(url)
        webSocket.removeEventListener('close', onClose)
        webSocket.removeEventListener('message', onMessage)
      }

      // Setup event listeners for RPC & subscription responses.
      webSocket.addEventListener('close', onClose)
      webSocket.addEventListener('message', onMessage)

      // Wait for the socket to open.
      if (webSocket.readyState === WebSocket.CONNECTING) {
        await new Promise((resolve, reject) => {
          if (!webSocket) return
          webSocket.onopen = resolve
          webSocket.onerror = reject
        })
      }

      // Create a new socket instance.
      socket = Object.assign(webSocket, {
        requests,
        subscriptions,
      })
      socketsCache.set(url, socket)

      return [socket]
    },
  })

  const [_, [socket_]] = await schedule()
  return socket_
}

export type WebSocketOptions = {
  /** The RPC request body. */
  body: RpcRequest
  /** The callback to invoke on response. */
  onResponse?: (message: RpcResponse) => void
}

export type WebSocketReturnType = Socket

export type WebSocketErrorType = WebSocketRequestError | ErrorType

function webSocket(
  socket: Socket,
  { body, onResponse }: WebSocketOptions,
): WebSocketReturnType {
  if (
    socket.readyState === socket.CLOSED ||
    socket.readyState === socket.CLOSING
  )
    throw new WebSocketRequestError({
      body,
      url: socket.url,
      details: 'Socket is closed.',
    })

  const id_ = id++

  const callback = ({ data }: { data: any }) => {
    const message: RpcResponse = JSON.parse(data)

    if (typeof message.id === 'number' && id_ !== message.id) return

    onResponse?.(message)

    // If we are subscribing to a topic, we want to set up a listener for incoming
    // messages.
    if (body.method === 'eth_subscribe' && typeof message.result === 'string') {
      socket.subscriptions.set(message.result, callback)
    }

    // If we are unsubscribing from a topic, we want to remove the listener.
    if (body.method === 'eth_unsubscribe') {
      socket.subscriptions.delete(body.params?.[0])
    }
  }
  socket.requests.set(id_, callback)

  socket.send(JSON.stringify({ jsonrpc: '2.0', ...body, id: id_ }))

  return socket
}

export type WebSocketAsyncOptions = {
  /** The RPC request body. */
  body: RpcRequest
  /** The timeout (in ms) for the request. */
  timeout?: number
}

export type WebSocketAsyncReturnType = RpcResponse

export type WebSocketAsyncErrorType =
  | WebSocketErrorType
  | TimeoutErrorType
  | WithTimeoutErrorType
  | ErrorType

async function webSocketAsync(
  socket: Socket,
  { body, timeout = 10_000 }: WebSocketAsyncOptions,
): Promise<WebSocketAsyncReturnType> {
  return withTimeout(
    () =>
      new Promise<RpcResponse>((onResponse) =>
        rpc.webSocket(socket, {
          body,
          onResponse,
        }),
      ),
    {
      errorInstance: new TimeoutError({ body, url: socket.url }),
      timeout,
    },
  )
}

///////////////////////////////////////////////////

export const rpc = {
  http,
  webSocket,
  webSocketAsync,
}
