import { Chain } from '../../chains'
import { Data } from '../../types'
import { RpcResponse, getSocket, rpc } from '../../utils/rpc'
import { Adapter, AdapterConfig, createAdapter } from './createAdapter'

type WebSocketAdapterSubscribeArgs = {
  onData: (data: RpcResponse) => void
  onError?: (error: any) => void
}

type WebSocketAdapterSubscribeResponse = {
  subscriptionId: Data
  unsubscribe: () => Promise<RpcResponse<boolean>>
}

type WebSocketAdapterSubscribe = {
  subscribe(
    args: WebSocketAdapterSubscribeArgs & {
      /**
       * @description Add information about compiled contracts
       * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_addcompilationresult
       */
      params: ['newHeads']
    },
  ): Promise<WebSocketAdapterSubscribeResponse>
}

export type WebSocketAdapterConfig<TChain extends Chain = Chain> = {
  /** The chain that the RPC should connect to. */
  chain: TChain
  /** The key of the WebSocket adapter. */
  key?: AdapterConfig['key']
  /** The name of the WebSocket adapter. */
  name?: AdapterConfig['name']
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string
}

export type WebSocketAdapter<TChain extends Chain = Chain> = Adapter<
  'network',
  {
    chain: TChain
    getSocket(): Promise<WebSocket>
    subscribe: WebSocketAdapterSubscribe['subscribe']
    transportMode: 'webSocket'
  }
>

/**
 * @description Creates a WebSocket adapter that connects to a JSON-RPC API.
 */
export function webSocket<TChain extends Chain = Chain>({
  chain,
  key = 'webSocket',
  name = 'WebSocket JSON-RPC',
  url = chain.rpcUrls.default.webSocket,
}: WebSocketAdapterConfig<TChain>): WebSocketAdapter<TChain> {
  if (!url) throw new Error('url is required')

  return createAdapter(
    {
      key,
      name,
      async request({ method, params }) {
        const socket = await getSocket(url)
        const { result } = await rpc.webSocketAsync(socket, {
          body: { method, params },
        })
        return result
      },
      type: 'network',
    },
    {
      chain,
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
      transportMode: 'webSocket',
    },
  )
}
