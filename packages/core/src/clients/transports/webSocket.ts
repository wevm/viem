import type { Chain } from '../../chains'
import type { Data } from '../../types'
import type { RpcResponse } from '../../utils/rpc'
import { getSocket, rpc } from '../../utils/rpc'
import type { Transport, TransportConfig } from './createTransport'
import { createTransport } from './createTransport'

type WebSocketTransportSubscribeArgs = {
  onData: (data: RpcResponse) => void
  onError?: (error: any) => void
}

type WebSocketTransportSubscribeResponse = {
  subscriptionId: Data
  unsubscribe: () => Promise<RpcResponse<boolean>>
}

type WebSocketTransportSubscribe = {
  subscribe(
    args: WebSocketTransportSubscribeArgs & {
      /**
       * @description Add information about compiled contracts
       * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_addcompilationresult
       */
      params: ['newHeads']
    },
  ): Promise<WebSocketTransportSubscribeResponse>
}

export type WebSocketTransportConfig<TChain extends Chain = Chain> = {
  /** The chain that the RPC should connect to. */
  chain: TChain
  /** The key of the WebSocket transport. */
  key?: TransportConfig['key']
  /** The name of the WebSocket transport. */
  name?: TransportConfig['name']
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url: string
}

export type WebSocketTransport<TChain extends Chain = Chain> = Transport<
  'webSocket',
  {
    getSocket(): Promise<WebSocket>
    subscribe: WebSocketTransportSubscribe['subscribe']
  },
  TChain
>

/**
 * @description Creates a WebSocket transport that connects to a JSON-RPC API.
 */
export function webSocket<TChain extends Chain = Chain>({
  chain,
  key = 'webSocket',
  name = 'WebSocket JSON-RPC',
  url,
}: WebSocketTransportConfig<TChain>): WebSocketTransport<TChain> {
  return createTransport(
    {
      chain,
      key,
      name,
      async request({ method, params }) {
        const socket = await getSocket(url)
        const { result } = await rpc.webSocketAsync(socket, {
          body: { method, params },
        })
        return result
      },
      type: 'webSocket',
    },
    {
      getSocket() {
        return getSocket(url)
      },
      async subscribe({ params, onData, onError }: any) {
        const socket = await getSocket(url)
        const { result: subscriptionId } = await new Promise<any>(
          (resolve, reject) =>
            rpc.webSocket(socket, {
              body: {
                method: 'eth_subscribe',
                params,
              },
              onData: (data) => {
                if (typeof data.id === 'number') {
                  resolve(data)
                  return
                }
                onData(data)
              },
              onError: (error) => {
                reject(error)
                onError?.(error)
              },
            }),
        )
        return {
          subscriptionId,
          async unsubscribe() {
            return new Promise<any>((resolve, reject) =>
              rpc.webSocket(socket, {
                body: {
                  method: 'eth_unsubscribe',
                  params: [subscriptionId],
                },
                onData: resolve,
                onError: reject,
              }),
            )
          },
        }
      },
    },
  )
}
