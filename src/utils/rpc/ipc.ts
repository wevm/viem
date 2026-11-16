import { connect, type Socket as NetSocket } from 'node:net'
import { WebSocketRequestError } from '../../index.js'
import {
  type GetSocketRpcClientParameters,
  getSocketRpcClient,
  type Socket,
  type SocketRpcClient,
} from './socket.js'

export type GetIpcRpcClientOptions = Pick<
  GetSocketRpcClientParameters,
  'reconnect'
>

const openingBrace = '{'.charCodeAt(0)
const closingBrace = '}'.charCodeAt(0)
const quote = '"'.charCodeAt(0)
const backslash = '\\'.charCodeAt(0)

/**
 * Splits a stream of concatenated JSON-RPC messages into complete messages.
 * Scanner state and the pending message's chunks carry over between calls,
 * so each byte is scanned once and each message is concatenated once.
 *
 * @internal
 */
export function createMessageExtractor(onMessage: (message: Buffer) => void) {
  let chunks: Buffer[] = []
  let level = 0
  let inString = false
  let escaped = false
  return (buffer: Buffer) => {
    let cursor = 0
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i]
      if (inString) {
        if (escaped) escaped = false
        else if (byte === backslash) escaped = true
        else if (byte === quote) inString = false
        continue
      }
      if (byte === quote) {
        inString = true
        continue
      }
      if (byte === openingBrace) level++
      if (byte === closingBrace) level--
      if (level === 0) {
        const end = buffer.subarray(cursor, i + 1)
        const message =
          chunks.length > 0 ? Buffer.concat([...chunks, end]) : end
        chunks = []
        cursor = i + 1
        if (
          message[0] === openingBrace &&
          message[message.length - 1] === closingBrace
        )
          onMessage(message)
      }
    }
    if (cursor < buffer.length) chunks.push(buffer.subarray(cursor))
  }
}

export type IpcRpcClient = SocketRpcClient<NetSocket>

export async function getIpcRpcClient(
  path: string,
  options: GetIpcRpcClientOptions = {},
): Promise<IpcRpcClient> {
  const { reconnect } = options

  return getSocketRpcClient({
    async getSocket({ onClose, onError, onOpen, onResponse }) {
      const socket = connect(path)

      function onClose_() {
        socket.off('close', onClose_)
        socket.off('data', onData)
        socket.off('error', onError)
        socket.off('connect', onOpen)
        onClose()
      }

      const onData = createMessageExtractor((message) =>
        onResponse(JSON.parse(message.toString())),
      )

      socket.on('close', onClose_)
      socket.on('data', onData)
      socket.on('error', onError)
      socket.on('connect', onOpen)

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
    reconnect,
    url: path,
  })
}
