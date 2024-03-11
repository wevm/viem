import { RpcRequestError } from '../../errors/request.js'
import {
  UrlRequiredError,
  type UrlRequiredErrorType,
} from '../../errors/transport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hash } from '../../types/misc.js'
import type { RpcResponse } from '../../types/rpc.js'
import { getSocket } from '../../utils/rpc/compat.js'
import type { SocketRpcClient } from '../../utils/rpc/socket.js'
import { getWebSocketRpcClient } from '../../utils/rpc/webSocket.js'
import {
  type CreateTransportErrorType,
  type Transport,
  type TransportConfig,
  createTransport,
} from './createTransport.js'

type WebSocketTransportSubscribeParameters = {
  onData: (data: RpcResponse) => void
  onError?: (error: any) => void
}

type WebSocketTransportSubscribeReturnType = {
  subscriptionId: Hash
  unsubscribe: () => Promise<RpcResponse<boolean>>
}

type WebSocketTransportSubscribe = {
  subscribe(
    args: WebSocketTransportSubscribeParameters & {
      /**
       * @description Add information about compiled contracts
       * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_addcompilationresult
       */
      params: ['newHeads']
    },
  ): Promise<WebSocketTransportSubscribeReturnType>
}

export type WebSocketTransportConfig = {
  /** The key of the WebSocket transport. */
  key?: TransportConfig['key']
  /** The name of the WebSocket transport. */
  name?: TransportConfig['name']
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount']
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay']
  /** The timeout (in ms) for async WebSocket requests. Default: 10_000 */
  timeout?: TransportConfig['timeout']
}

export type WebSocketTransport = Transport<
  'webSocket',
  {
    /**
     * @deprecated use `getRpcClient` instead.
     */
    getSocket(): Promise<WebSocket>
    getRpcClient(): Promise<SocketRpcClient<WebSocket>>
    subscribe: WebSocketTransportSubscribe['subscribe']
  }
>

export type WebSocketTransportErrorType =
  | CreateTransportErrorType
  | UrlRequiredErrorType
  | ErrorType

/**
 * @description Creates a WebSocket transport that connects to a JSON-RPC API.
 */
export function webSocket(
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string,
  config: WebSocketTransportConfig = {},
): WebSocketTransport {
  const { key = 'webSocket', name = 'WebSocket JSON-RPC', retryDelay } = config
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const retryCount = config.retryCount ?? retryCount_
    const timeout = timeout_ ?? config.timeout ?? 10_000
    const url_ = url || chain?.rpcUrls.default.webSocket?.[0]
    if (!url_) throw new UrlRequiredError()
    return createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          const body = { method, params }
          const rpcClient = await getWebSocketRpcClient(url_)
          const { error, result } = await rpcClient.requestAsync({
            body,
            timeout,
          })
          if (error)
            throw new RpcRequestError({
              body,
              error,
              url: url_,
            })
          return result
        },
        retryCount,
        retryDelay,
        timeout,
        type: 'webSocket',
      },
      {
        getSocket() {
          return getSocket(url_)
        },
        getRpcClient() {
          return getWebSocketRpcClient(url_)
        },
        async subscribe({ params, onData, onError }: any) {
          const rpcClient = await getWebSocketRpcClient(url_)
          const { result: subscriptionId } = await new Promise<any>(
            (resolve, reject) =>
              rpcClient.request({
                body: {
                  method: 'eth_subscribe',
                  params,
                },
                onResponse(response) {
                  if (response.error) {
                    reject(response.error)
                    onError?.(response.error)
                    return
                  }

                  if (typeof response.id === 'number') {
                    resolve(response)
                    return
                  }
                  if (response.method !== 'eth_subscription') return
                  onData(response.params)
                },
              }),
          )
          return {
            subscriptionId,
            async unsubscribe() {
              return new Promise<any>((resolve) =>
                rpcClient.request({
                  body: {
                    method: 'eth_unsubscribe',
                    params: [subscriptionId],
                  },
                  onResponse: resolve,
                }),
              )
            },
          }
        },
      },
    )
  }
}
