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

export type RpcRequest = {
  jsonrpc?: '2.0'
  method: string
  params?: any
  id?: number
}

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

    let data: any
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

export type SocketImpl<socketImpl extends {} = WebSocket> = socketImpl & {
  request: (request: RpcRequest) => void
}

export type Socket<socketImpl extends {} = WebSocket> =
  SocketImpl<socketImpl> & {
    onResponse: (response: RpcResponse) => void
    requestSync: (params: {
      body: RpcRequest
      onResponse: (message: RpcResponse) => void
    }) => Promise<RpcResponse>
    requests: CallbackMap
    subscriptions: CallbackMap
  }

export type GetSocketErrorType = CreateBatchSchedulerErrorType | ErrorType

export const socketsCache = /*#__PURE__*/ new Map<string, Socket<SocketImpl>>()

type SetupParameters = {
  onClose: () => void
  onData: (data: RpcResponse) => void
  url: string
}

export async function setupWebSocket({
  onClose,
  onData,
  url,
}: SetupParameters): Promise<SocketImpl<WebSocket>> {
  const WebSocket = await import('isows').then((module) => module.WebSocket)
  const socket = new WebSocket(url)

  const onMessage: (event: MessageEvent) => void = ({ data }) => {
    const message: RpcResponse = JSON.parse(data as string)
    onData(message)
  }
  const onClose_ = () => {
    onClose()
    socket.removeEventListener('close', onClose_)
    socket.removeEventListener('message', onMessage)
  }

  // Setup event listeners for RPC & subscription responses.
  socket.addEventListener('close', onClose_)
  socket.addEventListener('message', onMessage)

  // Wait for the socket to open.
  if (socket.readyState === WebSocket.CONNECTING) {
    await new Promise((resolve, reject) => {
      if (!socket) return
      socket.onopen = resolve
      socket.onerror = reject
    })
  }

  return Object.assign(socket, {
    request(body) {
      console.log('send')
      return socket.send(JSON.stringify(body))
    },
  } as SocketImpl<WebSocket>)
}

export async function getSocket<socketImpl extends SocketImpl>(
  url: string,
  {
    setup,
  }: {
    setup: (params: SetupParameters) => Promise<socketImpl>
  },
): Promise<Socket<socketImpl>> {
  let socket = socketsCache.get(url)

  // If the socket already exists, return it.
  if (socket) return socket as Socket<socketImpl>

  const { schedule } = createBatchScheduler<undefined, [Socket<socketImpl>]>({
    id: url,
    fn: async () => {
      // Set up a cache for incoming "synchronous" requests.
      const requests = new Map<Id, CallbackFn>()

      // Set up a cache for subscriptions (eth_subscribe).
      const subscriptions = new Map<Id, CallbackFn>()

      function onClose() {
        socketsCache.delete(url)
      }
      function onData(data: RpcResponse) {
        console.log('res')
        const isSubscription = data.method === 'eth_subscription'
        const id = isSubscription ? data.params.subscription : data.id
        const cache = isSubscription ? subscriptions : requests
        const callback = cache.get(id)
        if (callback) callback({ data })
        if (!isSubscription) cache.delete(id)
      }

      // Set up socket implementation.
      const socketImpl = await setup({ onClose, onData, url })

      // Create a new socket instance.
      socket = Object.assign(socketImpl as any, {
        requests,
        subscriptions,
      }) as Socket<socketImpl>
      socketsCache.set(url, socket)

      return [socket] as any
    },
  })

  const [_, [socket_]] = await schedule()

  async function requestSync({
    body,
    onResponse,
  }: { body: RpcRequest; onResponse: (message: RpcResponse) => void }) {
    const id_ = body.id ?? id++

    const callback = ({ data }: { data: RpcResponse }) => {
      console.log('ok')
      if (typeof data.id === 'number' && id_ !== data.id) return

      onResponse(data)

      // If we are subscribing to a topic, we want to set up a listener for incoming
      // messages.
      if (body.method === 'eth_subscribe' && typeof data.result === 'string') {
        socket_.subscriptions.set(data.result, callback)
      }

      // If we are unsubscribing from a topic, we want to remove the listener.
      if (body.method === 'eth_unsubscribe') {
        socket_.subscriptions.delete(body.params?.[0])
      }
    }

    socket_.requests.set(id_, callback)
    socket_.request({
      jsonrpc: '2.0',
      id: id_,
      ...body,
    })
  }

  return Object.assign(socket_, { requestSync }) as Socket<socketImpl>
}

export async function getWebSocket(url: string): Promise<Socket<WebSocket>> {
  return getSocket(url, { setup: setupWebSocket })
}

export type WebSocketOptions = {
  /** The RPC request body. */
  body: RpcRequest
  /** The callback to invoke on response. */
  onResponse: (message: RpcResponse) => void
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

  socket.requestSync({ body, onResponse })

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
