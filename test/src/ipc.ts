import { type Socket, createServer as createNetServer } from 'node:net'

/** A minimal real IPC (`node:net`) JSON server for tests. */
export function createServer(
  handler: (socket: Socket, message: string) => void,
): Promise<{
  close: () => Promise<unknown>
  path: string
  sockets: Set<Socket>
  dropAll: () => void
}> {
  const sockets = new Set<Socket>()
  const path = `/tmp/viem-test-${Date.now()}-${Math.random().toString(36).slice(2)}.ipc`
  const server = createNetServer((socket) => {
    sockets.add(socket)
    let buffer = Buffer.alloc(0) as Buffer
    socket.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([Uint8Array.from(buffer), Uint8Array.from(chunk)])
      const [messages, rest] = extractJsonMessages(buffer)
      for (const message of messages) handler(socket, message.toString())
      buffer = rest
    })
    socket.on('close', () => sockets.delete(socket))
    socket.on('error', () => sockets.delete(socket))
  })

  const closeAsync = () =>
    new Promise((resolve, reject) => {
      for (const socket of sockets) socket.destroy()
      server.close((err) => (err ? reject(err) : resolve(undefined)))
    })

  return new Promise((resolve) => {
    server.listen(path, () => {
      resolve({
        close: closeAsync,
        path,
        sockets,
        dropAll() {
          for (const socket of sockets) socket.destroy()
        },
      })
    })
  })
}

function extractJsonMessages(buffer: Buffer): [Buffer[], Buffer] {
  const openingBrace = '{'.charCodeAt(0)
  const closingBrace = '}'.charCodeAt(0)
  const messages: Buffer[] = []
  let cursor = 0
  let level = 0
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] === openingBrace) level++
    if (buffer[i] === closingBrace) level--
    if (level === 0) {
      const message = buffer.subarray(cursor, i + 1)
      if (
        message[0] === openingBrace &&
        message[message.length - 1] === closingBrace
      )
        messages.push(message)
      cursor = i + 1
    }
  }
  return [messages, buffer.subarray(cursor)]
}
