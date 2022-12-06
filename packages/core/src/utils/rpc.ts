import { BaseError } from './BaseError'
import { withRetry } from './promise'
import { withTimeout } from './promise/withTimeout'

let id = 0

export class HttpRequestError extends BaseError {
  name = 'HttpRequestError'
  status

  constructor({
    body,
    details,
    status,
    url,
  }: {
    body: { [key: string]: unknown }
    details: string
    status: number
    url: string
  }) {
    super({
      humanMessage: [
        'The HTTP request failed.',
        '',
        `Status: ${status}`,
        `URL: ${url}`,
        `Request body: ${JSON.stringify(body)}`,
      ].join('\n'),
      details,
    })
    this.status = status
  }
}

export class RpcError extends Error {
  code: number

  name = 'RpcError'

  constructor({ code, message }: { code: number; message: string }) {
    super(message)
    this.code = code
  }
}

export class TimeoutError extends BaseError {
  name = 'TimeoutError'

  constructor({
    body,
    url,
  }: {
    body: { [key: string]: unknown }
    url: string
  }) {
    super({
      humanMessage: [
        'The request took too long to respond.',
        '',
        `URL: ${url}`,
        `Request body: ${JSON.stringify(body)}`,
      ].join('\n'),
      details: 'The request timed out.',
    })
  }
}

export type RpcResponse<TResult = any, TError = any> = {
  jsonrpc: `${number}`
  id: number
} & (
  | {
      result: TResult
      error?: never
    }
  | { result?: never; error: TError }
)

///////////////////////////////////////////////////
// HTTP

async function http(
  url: string,
  {
    body,
    retryDelay = 100,
    retryCount = 2,
    timeout = 0,
  }: {
    // The RPC request body.
    body: { method: string; params?: any[] }
    // The base delay (in ms) between retries.
    retryDelay?: number
    // The max number of times to retry.
    retryCount?: number
    // The timeout (in ms) for the request.
    timeout?: number
  },
) {
  const response = await withRetry(
    () =>
      withTimeout(
        async ({ signal }) => {
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }),
            signal: timeout > 0 ? signal : undefined,
          })
          return response
        },
        {
          errorInstance: new TimeoutError({ body, url }),
          timeout,
          signal: true,
        },
      ),
    {
      delay: ({ count, data }) => {
        const retryAfter = data?.headers.get('Retry-After')
        if (retryAfter?.match(/\d/)) return parseInt(retryAfter) * 1000
        return ~~((Math.random() + 0.5) * (1 << count)) * retryDelay
      },
      retryCount,
      shouldRetryOnResponse: async ({ data }) => {
        if (data.status >= 500) return true
        if ([408, 413, 429].includes(data.status)) return true
        return false
      },
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
      details: JSON.stringify(data.error) || response.statusText,
      status: response.status,
      url,
    })
  }

  if (data.error) {
    throw new RpcError(data.error)
  }
  return data as RpcResponse
}

///////////////////////////////////////////////////
// WebSocket

const sockets = new Map<string, WebSocket>()

export async function getSocket(url: string) {
  let socket = sockets.get(url)
  if (!socket) {
    socket = new WebSocket(url)
    sockets.set(url, socket)
  }
  if (socket.readyState === WebSocket.CONNECTING) {
    await new Promise((resolve, reject) => {
      if (socket) {
        socket.onopen = resolve
        socket.onerror = reject
      }
    })
  }
  return socket
}

function webSocket(
  socket: WebSocket,
  {
    body,
    onData,
    onError,
  }: {
    // The RPC request body.
    body: { method: string; params?: any[]; id?: number }
    // The callback to invoke when the request is successful.
    onData: (message: RpcResponse) => void
    // The callback to invoke if the request errors.
    onError: (message: RpcResponse['error']) => void
  },
) {
  socket.send(JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }))

  socket.onmessage = ({ data }) => {
    const message: RpcResponse = JSON.parse(data)
    if (message.error) {
      onError(message.error)
    } else {
      onData(message)
    }
  }

  return socket
}

async function webSocketAsync(
  socket: WebSocket,
  {
    body,
    timeout = 0,
  }: {
    // The RPC request body.
    body: { method: string; params?: any[] }
    // The timeout (in ms) for the request.
    timeout?: number
  },
) {
  let id_ = id++

  return withTimeout(
    () =>
      new Promise<RpcResponse>((resolve, reject) => {
        const body_ = { ...body, id: id_ }
        return rpc.webSocket(socket, {
          body: body_,
          onData: (message) => {
            /* c8 ignore next */
            if (message.id !== id_) return
            resolve(message)
          },
          onError: (error) => {
            reject(new RpcError(error))
          },
        })
      }),
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
