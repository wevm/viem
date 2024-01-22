import { type Socket as NetSocket } from 'node:net'
import { WebSocketRequestError } from '../../index.js'
import { type Socket, type SocketClient, createSocketClient } from './socket.js'

const openingBrace = '{'.charCodeAt(0)
const closingBrace = '}'.charCodeAt(0)

export function extractMessages(buffer: Buffer): [Buffer[], Buffer] {
  const messages: Buffer[] = []

  let cursor = 0
  let level = 0
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] === openingBrace) level++
    if (buffer[i] === closingBrace) level--
    if (level === 0) {
      messages.push(buffer.subarray(cursor, i + 1))
      cursor = i + 1
    }
  }

  return [messages, buffer.subarray(cursor)]
}

export type IpcClient = SocketClient<NetSocket>

export async function createIpcClient(path: string): Promise<IpcClient> {
  return createSocketClient({
    async getSocket({ onResponse }) {
      const { connect } = await import('node:net')
      const socket = connect(path)

      function onClose() {
        socket.off('close', onClose)
        socket.off('message', onData)
      }

      let lastRemaining = Buffer.alloc(0)
      function onData(buffer: Buffer) {
        const [messages, remaining] = extractMessages(
          Buffer.concat([lastRemaining, buffer]),
        )
        for (const message of messages) {
          const response = JSON.parse(Buffer.from(message).toString())
          onResponse(response)
        }
        lastRemaining = remaining
      }

      socket.on('close', onClose)
      socket.on('data', onData)

      // Wait for the socket to open.
      await new Promise<void>((resolve, reject) => {
        socket.on('ready', () => {
          resolve()
          socket.off('error', reject)
        })
        socket.on('error', reject)
      })

      return Object.assign(socket, {
        close() {
          socket.destroy()
          socket.end()
        },
        request({ body }) {
          if (socket.readyState !== 'open')
            throw new WebSocketRequestError({
              body,
              url: path,
              details: 'Socket is closed.',
            })

          return socket.write(JSON.stringify(body))
        },
      } as Socket<{}>)
    },
    url: path,
  })
}
