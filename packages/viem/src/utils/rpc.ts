let id = 0

type RpcResponse = {
  jsonrpc: `${number}`
  id: number
} & (
  | {
      result: any
      error?: never
    }
  | { result?: never; error: any }
)

///////////////////////////////////////////////////
// HTTP

async function http(
  url: string,
  { body }: { body: { method: string; params?: any[] } },
) {
  const response: RpcResponse = await (
    await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }),
    })
  ).json()
  if (response.error) {
    throw response.error
  }
  return response
}

///////////////////////////////////////////////////
// WebSocket

const sockets = new Map()

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

async function webSocket(
  socket: WebSocket,
  {
    body,
    onMessage,
    onError,
  }: {
    body: { method: string; params?: any[] }
    onMessage: (message: RpcResponse) => void
    onError: (message: RpcResponse['error']) => void
  },
) {
  socket.send(JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }))

  socket.onmessage = ({ data }) => {
    const message: RpcResponse = JSON.parse(data)
    if (message.error) {
      onError(message.error)
    } else {
      onMessage(message)
    }
  }

  return socket
}

///////////////////////////////////////////////////

export const rpc = {
  http,
  webSocket,
}
