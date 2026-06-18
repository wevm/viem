import { createHash } from 'node:crypto'
import { createServer as createHttpServer } from 'node:http'
import type { AddressInfo, Socket } from 'node:net'

const wsGuid = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

/** A single accepted WebSocket connection on the test server. */
export type WebSocketConnection = {
  /** Text messages received from the client. */
  readonly messages: string[]
  /** Sends a text frame to the client. */
  send(data: string): void
  /** Closes the underlying TCP socket (simulates a drop). */
  close(): void
}

/**
 * A minimal real RFC6455 WebSocket server (no `ws` dependency) for tests. The
 * `handler` is invoked with each connection and decoded text message.
 */
export function createServer(
  handler: (connection: WebSocketConnection, message: string) => void,
): Promise<{
  close: () => Promise<unknown>
  url: string
  connections: WebSocketConnection[]
  dropAll: () => void
}> {
  const sockets = new Set<Socket>()
  const connections: WebSocketConnection[] = []
  const server = createHttpServer()

  server.on('upgrade', (req, socket) => {
    sockets.add(socket as Socket)
    const key = req.headers['sec-websocket-key']
    const accept = createHash('sha1')
      .update(key + wsGuid)
      .digest('base64')
    socket.write(
      [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${accept}`,
        '\r\n',
      ].join('\r\n'),
    )

    const connection: WebSocketConnection = {
      messages: [],
      send(data) {
        socket.write(encodeFrame(data))
      },
      close() {
        socket.destroy()
      },
    }
    connections.push(connection)

    let buffer = Buffer.alloc(0) as Buffer
    socket.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([Uint8Array.from(buffer), Uint8Array.from(chunk)])
      while (true) {
        const frame = decodeFrame(buffer)
        if (!frame) break
        buffer = frame.rest
        if (frame.opcode === 0x8) {
          socket.destroy()
          break
        }
        if (frame.opcode === 0x1) {
          const message = frame.payload.toString()
          connection.messages.push(message)
          handler(connection, message)
        }
      }
    })
    socket.on('close', () => sockets.delete(socket as Socket))
    socket.on('error', () => sockets.delete(socket as Socket))
  })

  const closeAsync = () =>
    new Promise((resolve, reject) => {
      for (const socket of sockets) socket.destroy()
      server.close((err) => (err ? reject(err) : resolve(undefined)))
    })

  return new Promise((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo
      resolve({
        close: closeAsync,
        url: `ws://localhost:${port}`,
        connections,
        dropAll() {
          for (const socket of sockets) socket.destroy()
        },
      })
    })
  })
}

function encodeFrame(data: string): Buffer {
  const payload = Buffer.from(data)
  const length = payload.length
  let header: Buffer
  if (length < 126) header = Buffer.from([0x81, length])
  else if (length < 65536) {
    header = Buffer.alloc(4)
    header[0] = 0x81
    header[1] = 126
    header.writeUInt16BE(length, 2)
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x81
    header[1] = 127
    header.writeBigUInt64BE(BigInt(length), 2)
  }
  return Buffer.concat([Uint8Array.from(header), Uint8Array.from(payload)])
}

function decodeFrame(
  buffer: Buffer,
): { opcode: number; payload: Buffer; rest: Buffer } | null {
  if (buffer.length < 2) return null
  const opcode = buffer[0] & 0x0f
  const masked = (buffer[1] & 0x80) !== 0
  let length = buffer[1] & 0x7f
  let offset = 2
  if (length === 126) {
    if (buffer.length < 4) return null
    length = buffer.readUInt16BE(2)
    offset = 4
  } else if (length === 127) {
    if (buffer.length < 10) return null
    length = Number(buffer.readBigUInt64BE(2))
    offset = 10
  }
  let mask: Buffer | undefined
  if (masked) {
    if (buffer.length < offset + 4) return null
    mask = buffer.subarray(offset, offset + 4)
    offset += 4
  }
  if (buffer.length < offset + length) return null
  let payload = buffer.subarray(offset, offset + length)
  if (mask) {
    const out = Buffer.alloc(length)
    for (let i = 0; i < length; i++) out[i] = payload[i] ^ mask[i % 4]
    payload = out
  }
  return { opcode, payload, rest: buffer.subarray(offset + length) }
}
