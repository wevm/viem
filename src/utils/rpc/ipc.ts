import { type Socket as NetSocket, connect } from 'node:net'
import { WebSocketRequestError } from '../../index.js'
import {
  type Socket,
  type SocketRpcClient,
  getSocketRpcClient,
} from './socket.js'

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

export type IpcRpcClient = SocketRpcClient<NetSocket>

export async function getIpcRpcClient(path: string): Promise<IpcRpcClient> {
  return getSocketRpcClient({
    async getSocket({ onResponse }) {
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
