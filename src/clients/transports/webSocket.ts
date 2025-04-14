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
import {
  type GetWebSocketRpcClientOptions,
  getWebSocketRpcClient,
} from '../../utils/rpc/webSocket.js'
import {
  type CreateTransportErrorType,
  type Transport,
  type TransportConfig,
  createTransport,
} from './createTransport.js'

type WebSocketTransportSubscribeParameters = {
  onData: (data: RpcResponse) => void
  onError?: ((error: any) => void) | undefined
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
  /**
   * Whether or not to send keep-alive ping messages.
   * @default true
   */
  keepAlive?: GetWebSocketRpcClientOptions['keepAlive'] | undefined
  /** The key of the WebSocket transport. */
  key?: TransportConfig['key'] | undefined
  /** Methods to include or exclude from executing RPC requests. */
  methods?: TransportConfig['methods'] | undefined
  /** The name of the WebSocket transport. */
  name?: TransportConfig['name'] | undefined
  /**
   * Whether or not to attempt to reconnect on socket failure.
   * @default true
   */
  reconnect?: GetWebSocketRpcClientOptions['reconnect'] | undefined
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount'] | undefined
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay'] | undefined
  /** The timeout (in ms) for async WebSocket requests. Default: 10_000 */
  timeout?: TransportConfig['timeout'] | undefined
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
  const {
    keepAlive,
    key = 'webSocket',
    methods,
    name = 'WebSocket JSON-RPC',
    reconnect,
    retryDelay,
  } = config
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const retryCount = config.retryCount ?? retryCount_
    const timeout = timeout_ ?? config.timeout ?? 10_000
    const url_ = url || chain?.rpcUrls.default.webSocket?.[0]
    const wsRpcClientOpts = { keepAlive, reconnect }
    if (!url_) throw new UrlRequiredError()
    return createTransport(
      {
        key,
        methods,
        name,
        async request({ method, params }) {
          const body = { method, params }
          const rpcClient = await getWebSocketRpcClient(url_, wsRpcClientOpts)
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
          return getWebSocketRpcClient(url_, wsRpcClientOpts)
        },
        async subscribe({ params, onData, onError }: any) {
          const rpcClient = await getWebSocketRpcClient(url_, wsRpcClientOpts)
          const { result: subscriptionId } = await new Promise<any>(
            (resolve, reject) =>
              rpcClient.request({
                body: {
                  method: 'eth_subscribe',
                  params,
                },
                onError(error) {
                  reject(error)
                  onError?.(error)
                  return
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
