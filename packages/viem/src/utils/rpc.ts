import { BaseError } from './BaseError'

let id = 0

class RequestTimeoutError extends BaseError {
  name = 'RequestTimeoutError'

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
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response: RpcResponse = await (
      await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }),
        signal: timeout > 0 ? controller.signal : undefined,
      })
    ).json()

    clearTimeout(timeoutId)

    if (response.error) {
      throw response.error
    }
    return response
  } catch (err) {
    if ((<Error>err).name === 'AbortError')
      throw new RequestTimeoutError({ body })
    throw err
  }
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
  return new Promise<any>((resolve, reject) => {
    let timeoutId: NodeJS.Timer
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        reject(new RequestTimeoutError({ body }))
      }, timeout)
    }
    return rpc.webSocket(socket, {
      body,
      onData: (message) => {
        clearTimeout(timeoutId)
        resolve(message)
      },
      onError: (error) => {
        clearTimeout(timeoutId)
        reject(error)
      },
    })
  })
}

///////////////////////////////////////////////////

export const rpc = {
  http,
  webSocket,
  webSocketAsync,
}
