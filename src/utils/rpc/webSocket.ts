import type { MessageEvent } from 'isows'

import { WebSocketRequestError } from '../../errors/request.js'
import {
  type GetSocketRpcClientParameters,
  type Socket,
  type SocketRpcClient,
  getSocketRpcClient,
} from './socket.js'

export type GetWebSocketRpcClientOptions = Pick<
  GetSocketRpcClientParameters,
  'reconnect'
>

export async function getWebSocketRpcClient(
  url: string,
  options: GetWebSocketRpcClientOptions | undefined = {},
): Promise<SocketRpcClient<WebSocket>> {
  const { reconnect } = options

  return getSocketRpcClient({
    async getSocket({ onError, onOpen, onResponse }) {
      const WebSocket = await import('isows').then((module) => module.WebSocket)
      const socket = new WebSocket(url)

      function onClose() {
        socket.removeEventListener('close', onClose)
        socket.removeEventListener('message', onMessage)
        socket.removeEventListener('error', onError)
        socket.removeEventListener('open', onOpen)
      }
      function onMessage({ data }: MessageEvent) {
        onResponse(JSON.parse(data))
      }

      // Setup event listeners for RPC & subscription responses.
      socket.addEventListener('close', onClose)
      socket.addEventListener('message', onMessage)
      socket.addEventListener('error', onError)
      socket.addEventListener('open', onOpen)

      // Wait for the socket to open.
      if (socket.readyState === WebSocket.CONNECTING) {
        await new Promise((resolve, reject) => {
          if (!socket) return
          socket.onopen = resolve
          socket.onerror = reject
        })
      }

      const { close: close_ } = socket

      return Object.assign(socket, {
        close() {
          close_.bind(socket)()
          onClose()
        },
        request({ body }) {
          if (
            socket.readyState === socket.CLOSED ||
            socket.readyState === socket.CLOSING
          )
            throw new WebSocketRequestError({
              body,
              url: socket.url,
              details: 'Socket is closed.',
            })

          return socket.send(JSON.stringify(body))
        },
      } as Socket<WebSocket>)
    },
    reconnect,
    url,
  })
}
