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
type CallbackFn = (message: any) => void
type CallbackMap = Map<Id, CallbackFn>

export type GetSocketParameters = {
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
    onError?: (error: Error) => void
    onResponse: (message: RpcResponse) => void
  }): void
  requestAsync(params: {
    body: RpcRequest
    timeout?: number
  }): Promise<RpcResponse>
  requests: CallbackMap
  subscriptions: CallbackMap
  url: string
}

export type GetSocketRpcClientParameters<socket extends {}> = {
  url: string
  getSocket(params: GetSocketParameters): Promise<Socket<socket>>
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
  const { getSocket, url } = params

  let socketClient = socketClientCache.get(url)

  // If the socket already exists, return it.
  if (socketClient) return socketClient as {} as SocketRpcClient<socket>

  const { schedule } = createBatchScheduler<
    undefined,
    [SocketRpcClient<socket>]
  >({
    id: url,
    fn: async () => {
      // Set up a cache for incoming "synchronous" requests.
      const requests = new Map<Id, CallbackFn>()

      // Set up a cache for subscriptions (eth_subscribe).
      const subscriptions = new Map<Id, CallbackFn>()

      // Set up socket implementation.
      const socket = await getSocket({
        onResponse(data) {
          const isSubscription = data.method === 'eth_subscription'
          const id = isSubscription ? data.params.subscription : data.id
          const cache = isSubscription ? subscriptions : requests
          const callback = cache.get(id)
          if (callback) callback(data)
          if (!isSubscription) cache.delete(id)
        },
      })

      // Create a new socket instance.
      socketClient = {
        close() {
          socket.close()
          socketClientCache.delete(url)
        },
        socket,
        request({ body, onError, onResponse }) {
          const id = body.id ?? idCache.take()

          const callback = (response: RpcResponse) => {
            if (typeof response.id === 'number' && id !== response.id) return

            // If we are subscribing to a topic, we want to set up a listener for incoming
            // messages.
            if (
              body.method === 'eth_subscribe' &&
              typeof response.result === 'string'
            )
              subscriptions.set(response.result, callback)

            // If we are unsubscribing from a topic, we want to remove the listener.
            if (body.method === 'eth_unsubscribe')
              subscriptions.delete(body.params?.[0])

            onResponse(response)

            // TODO: delete request?
          }

          requests.set(id, callback)
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
      socketClientCache.set(url, socketClient)

      return [socketClient as {} as SocketRpcClient<socket>]
    },
  })

  const [_, [socketClient_]] = await schedule()
  return socketClient_
}
