import { BaseError } from './BaseError'
import { withTimeout } from './promise/withTimeout'

let id = 0

export class RpcTimeoutError extends BaseError {
  name = 'RpcTimeoutError'

  constructor({ body }: { body: { [key: string]: unknown } }) {
    super({
      humanMessage: 'The request took too long to respond.',
      details: `The request timed out. Request body: ${JSON.stringify(body)}`,
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
    timeout = 0,
  }: { body: { method: string; params?: any[] }; timeout?: number },
) {
  const response = await withTimeout(
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
    { errorInstance: new RpcTimeoutError({ body }), timeout, signal: true },
  )

  const data = await response.json()
  if (data.error) {
    throw data.error
  }
  return <RpcResponse>data
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
    body: { method: string; params?: any[] }
    onData: (message: RpcResponse) => void
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
    body: { method: string; params?: any[] }
    timeout?: number
  },
) {
  return withTimeout(
    () =>
      new Promise<RpcResponse>((resolve, reject) => {
        return rpc.webSocket(socket, {
          body,
          onData: (message) => {
            resolve(message)
          },
          onError: (error) => {
            reject(error)
          },
        })
      }),
    { errorInstance: new RpcTimeoutError({ body }), timeout },
  )
}

///////////////////////////////////////////////////

export const rpc = {
  http,
  webSocket,
  webSocketAsync,
}
