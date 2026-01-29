import { RpcRequestError } from '../../errors/request.js'
import type { UrlRequiredErrorType } from '../../errors/transport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hash } from '../../types/misc.js'
import type { RpcResponse } from '../../types/rpc.js'
import {
  type GetIpcRpcClientOptions,
  type IpcRpcClient,
  getIpcRpcClient,
} from '../../utils/rpc/ipc.js'
import {
  type CreateTransportErrorType,
  type Transport,
  type TransportConfig,
  createTransport,
} from './createTransport.js'

type IpcTransportSubscribeParameters = {
  onData: (data: RpcResponse) => void
  onError?: ((error: any) => void) | undefined
}

type IpcTransportSubscribeReturnType = {
  subscriptionId: Hash
  unsubscribe: () => Promise<RpcResponse<boolean>>
}

type IpcTransportSubscribe = {
  subscribe(
    args: IpcTransportSubscribeParameters & {
      /**
       * @description Add information about compiled contracts
       * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_addcompilationresult
       */
      params: ['newHeads']
    },
  ): Promise<IpcTransportSubscribeReturnType>
}

export type IpcTransportConfig = {
  /** The key of the Ipc transport. */
  key?: TransportConfig['key'] | undefined
  /** Methods to include or exclude from executing RPC requests. */
  methods?: TransportConfig['methods'] | undefined
  /** The name of the Ipc transport. */
  name?: TransportConfig['name'] | undefined
  /**
   * Whether or not to attempt to reconnect on socket failure.
   * @default true
   */
  reconnect?: GetIpcRpcClientOptions['reconnect'] | undefined
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount'] | undefined
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay'] | undefined
  /** The timeout (in ms) for async Ipc requests. Default: 10_000 */
  timeout?: TransportConfig['timeout'] | undefined
}

export type IpcTransport = Transport<
  'ipc',
  {
    getRpcClient(): Promise<IpcRpcClient>
    subscribe: IpcTransportSubscribe['subscribe']
  }
>

export type IpcTransportErrorType =
  | CreateTransportErrorType
  | UrlRequiredErrorType
  | ErrorType

/**
 * @description Creates an IPC transport that connects to a JSON-RPC API.
 */
export function ipc(
  path: string,
  config: IpcTransportConfig = {},
): IpcTransport {
  const {
    key = 'ipc',
    methods,
    name = 'IPC JSON-RPC',
    reconnect,
    retryDelay,
  } = config
  return ({ retryCount: retryCount_, timeout: timeout_ }) => {
    const retryCount = config.retryCount ?? retryCount_
    const timeout = timeout_ ?? config.timeout ?? 10_000
    return createTransport(
      {
        key,
        methods,
        name,
        async request({ method, params }) {
          const body = { method, params }
          const rpcClient = await getIpcRpcClient(path, { reconnect })
          const { error, result } = await rpcClient.requestAsync({
            body,
            timeout,
          })
          if (error)
            throw new RpcRequestError({
              body,
              error,
              url: path,
            })
          return result
        },
        retryCount,
        retryDelay,
        timeout,
        type: 'ipc',
      },
      {
        getRpcClient() {
          return getIpcRpcClient(path)
        },
        async subscribe({ params, onData, onError }: any) {
          const rpcClient = await getIpcRpcClient(path)
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
