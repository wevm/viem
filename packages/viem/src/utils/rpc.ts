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

export async function createWebSocket(url: string) {
  const socket = new WebSocket(url)
  await new Promise((resolve, reject) => {
    if (socket) {
      socket.onopen = resolve
      socket.onerror = reject
    }
  })
  return socket
}

async function webSocket(
  socket: WebSocket,
  { body }: { body: { method: string; params?: any[] } },
) {
  socket.send(JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }))

  const response: RpcResponse = await new Promise((resolve) => {
    socket.onmessage = ({ data }) => {
      resolve(JSON.parse(data))
    }
  })
  if (response.error) {
    throw response.error
  }
  return response
}

///////////////////////////////////////////////////

export const rpc = {
  http,
  webSocket,
}
