import { TimeoutError } from '../../errors/request.js'
import type { ErrorType } from '../../errors/utils.js'
import type { RpcRequest, RpcResponse } from '../../types/rpc.js'
import {
  type CreateBatchSchedulerErrorType,
  createBatchScheduler,
} from '../promise/createBatchScheduler.js'
import { withTimeout } from '../promise/withTimeout.js'
import { idCache } from './id.js'

type Id = string | number
type CallbackFn = {
  onResponse: (message: any) => void
  onError?: ((error?: Error | Event | undefined) => void) | undefined
}
type CallbackMap = Map<Id, CallbackFn>

export type GetSocketParameters = {
  onError: (error?: Error | Event | undefined) => void
  onOpen: () => void
  onResponse: (data: RpcResponse) => void
}

export type Socket<socket extends {}> = socket & {
  close(): void
  request(params: {
    body: RpcRequest
  }): void
}

export type SocketRpcClient<socket extends {}> = {
  close(): void
  socket: Socket<socket>
  request(params: {
    body: RpcRequest
    onError?: ((error?: Error | Event | undefined) => void) | undefined
    onResponse: (message: RpcResponse) => void
  }): void
  requestAsync(params: {
    body: RpcRequest
    timeout?: number | undefined
  }): Promise<RpcResponse>
  requests: CallbackMap
  subscriptions: CallbackMap
  url: string
}

export type GetSocketRpcClientParameters<socket extends {} = {}> = {
  getSocket(params: GetSocketParameters): Promise<Socket<socket>>
  key?: string
  /**
   * Whether or not to attempt to reconnect on socket failure.
   * @default true
   */
  reconnect?:
    | boolean
    | {
        /**
         * The maximum number of reconnection attempts.
         * @default 5
         */
        attempts?: number | undefined
        /**
         * The delay (in ms) between reconnection attempts.
         * @default 2_000
         */
        delay?: number | undefined
      }
    | undefined
  url: string
}

export type GetSocketRpcClientErrorType =
  | CreateBatchSchedulerErrorType
  | ErrorType

export const socketClientCache = /*#__PURE__*/ new Map<
  string,
  SocketRpcClient<Socket<{}>>
>()

export async function getSocketRpcClient<socket extends {}>(
  params: GetSocketRpcClientParameters<socket>,
): Promise<SocketRpcClient<socket>> {
  const { getSocket, key = 'socket', reconnect = true, url } = params
  const { attempts = 5, delay = 2_000 } =
    typeof reconnect === 'object' ? reconnect : {}

  let socketClient = socketClientCache.get(`${key}:${url}`)

  // If the socket already exists, return it.
  if (socketClient) return socketClient as {} as SocketRpcClient<socket>

  let reconnectCount = 0
  const { schedule } = createBatchScheduler<
    undefined,
    [SocketRpcClient<socket>]
  >({
    id: `${key}:${url}`,
    fn: async () => {
      // Set up a cache for incoming "synchronous" requests.
      const requests = new Map<Id, CallbackFn>()

      // Set up a cache for subscriptions (eth_subscribe).
      const subscriptions = new Map<Id, CallbackFn>()

      let error: Error | Event | undefined
      let socket: Socket<any>
      // Set up socket implementation.
      async function setup() {
        return getSocket({
          onError(error_) {
            error = error_

            // Notify all requests and subscriptions of the error.
            for (const request of requests.values()) request.onError?.(error)
            for (const subscription of subscriptions.values())
              subscription.onError?.(error)

            // Clear all requests and subscriptions.
            requests.clear()
            subscriptions.clear()

            // Attempt to reconnect.
            if (reconnect && reconnectCount < attempts)
              setTimeout(async () => {
                reconnectCount++
                socket = await setup().catch(console.error)
              }, delay)
          },
          onOpen() {
            error = undefined
            reconnectCount = 0
          },
          onResponse(data) {
            const isSubscription = data.method === 'eth_subscription'
            const id = isSubscription ? data.params.subscription : data.id
            const cache = isSubscription ? subscriptions : requests
            const callback = cache.get(id)
            if (callback) callback.onResponse(data)
            if (!isSubscription) cache.delete(id)
          },
        })
      }
      socket = await setup()
      error = undefined

      // Create a new socket instance.
      socketClient = {
        close() {
          socket.close()
          socketClientCache.delete(`${key}:${url}`)
        },
        socket,
        request({ body, onError, onResponse }) {
          if (error && onError) onError(error)

          const id = body.id ?? idCache.take()

          const callback = (response: RpcResponse) => {
            if (typeof response.id === 'number' && id !== response.id) return

            // If we are subscribing to a topic, we want to set up a listener for incoming
            // messages.
            if (
              body.method === 'eth_subscribe' &&
              typeof response.result === 'string'
            )
              subscriptions.set(response.result, {
                onResponse: callback,
                onError,
              })

            // If we are unsubscribing from a topic, we want to remove the listener.
            if (body.method === 'eth_unsubscribe')
              subscriptions.delete(body.params?.[0])

            onResponse(response)
          }

          requests.set(id, { onResponse: callback, onError })
          try {
            socket.request({
              body: {
                jsonrpc: '2.0',
                id,
                ...body,
              },
            })
          } catch (error) {
            onError?.(error as Error)
          }
        },
        requestAsync({ body, timeout = 10_000 }) {
          return withTimeout(
            () =>
              new Promise<RpcResponse>((onResponse, onError) =>
                this.request({
                  body,
                  onError,
                  onResponse,
                }),
              ),
            {
              errorInstance: new TimeoutError({ body, url }),
              timeout,
            },
          )
        },
        requests,
        subscriptions,
        url,
      }
      socketClientCache.set(`${key}:${url}`, socketClient)

      return [socketClient as {} as SocketRpcClient<socket>]
    },
  })

  const [_, [socketClient_]] = await schedule()
  return socketClient_
}
