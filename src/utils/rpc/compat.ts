/* c8 ignore start */
import {
  type TimeoutErrorType,
  WebSocketRequestError,
} from '../../errors/request.js'
import type { ErrorType } from '../../errors/utils.js'
import type { RpcResponse } from '../../types/rpc.js'
import { type WithTimeoutErrorType } from '../promise/withTimeout.js'
import { type HttpRequestParameters, createHttpClient } from './http.js'
import { type SocketClient } from './socket.js'
import { createWebSocketClient } from './webSocket.js'

export type WebSocketOptions = Parameters<SocketClient<WebSocket>['request']>[0]
export type WebSocketReturnType = SocketClient<WebSocket>
export type WebSocketErrorType = WebSocketRequestError | ErrorType

function webSocket(
  socketClient: SocketClient<WebSocket>,
  { body, onError, onResponse }: WebSocketOptions,
): WebSocketReturnType {
  socketClient.request({
    body,
    onError,
    onResponse,
  })
  return socketClient
}

export type WebSocketAsyncOptions = Parameters<
  SocketClient<WebSocket>['requestAsync']
>[0]
export type WebSocketAsyncReturnType = RpcResponse
export type WebSocketAsyncErrorType =
  | WebSocketErrorType
  | TimeoutErrorType
  | WithTimeoutErrorType
  | ErrorType

async function webSocketAsync(
  socketClient: SocketClient<WebSocket>,
  { body, timeout = 10_000 }: WebSocketAsyncOptions,
): Promise<WebSocketAsyncReturnType> {
  return socketClient.requestAsync({
    body,
    timeout,
  })
}

/**
 * @deprecated use `getSocketClient` instead.
 *
 * ```diff
 * -import { getSocket } from 'viem/utils'
 * +import { getSocketClient } from 'viem/utils'
 *
 * -const socket = await getSocket(url)
 * +const socketClient = await getSocketClient(url)
 * +const socket = socketClient.socket
 * ```
 */
export async function getSocket(url: string) {
  const client = await createWebSocketClient(url)
  return Object.assign(client.socket, {
    requests: client.requests,
    subscriptions: client.subscriptions,
  })
}

export const rpc = {
  /**
   * @deprecated use `getHttpClient` instead.
   *
   * ```diff
   * -import { rpc } from 'viem/utils'
   * +import { getHttpClient } from 'viem/utils'
   *
   * -rpc.http(url, params)
   * +const httpClient = createHttpClient(url)
   * +httpClient.request(params)
   * ```
   */
  http(url: string, params: HttpRequestParameters) {
    return createHttpClient(url).request(params)
  },
  /**
   * @deprecated use `createWebSocketClient` instead.
   *
   * ```diff
   * -import { rpc } from 'viem/utils'
   * +import { createWebSocketClient } from 'viem/utils'
   *
   * -rpc.webSocket(url, params)
   * +const webSocketClient = createWebSocketClient(url)
   * +webSocketClient.request(params)
   * ```
   */
  webSocket,
  /**
   * @deprecated use `createWebSocketClient` instead.
   *
   * ```diff
   * -import { rpc } from 'viem/utils'
   * +import { createWebSocketClient } from 'viem/utils'
   *
   * -const response = await rpc.webSocketAsync(url, params)
   * +const webSocketClient = createWebSocketClient(url)
   * +const response = await webSocketClient.requestAsync(params)
   * ```
   */
  webSocketAsync,
}
/* c8 ignore end */
