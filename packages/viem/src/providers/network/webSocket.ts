import { Chain } from '../../chains'
import { Data } from '../../types/ethereum-provider'
import { RpcResponse, getSocket, rpc } from '../../utils/rpc'
import { NetworkProvider, createNetworkProvider } from './createNetworkProvider'

type WebSocketProviderSubscribeArgs = {
  onData: (data: RpcResponse) => void
  onError?: (error: any) => void
}

type WebSocketProviderSubscribeResponse = {
  subscriptionId: Data
  unsubscribe: () => Promise<RpcResponse<boolean>>
}

type WebSocketProviderSubscribe = {
  subscribe(
    args: WebSocketProviderSubscribeArgs & {
      /**
       * @description Add information about compiled contracts
       * @link https://hardhat.org/hardhat-network/docs/reference#hardhat_addcompilationresult
       */
      params: ['newHeads']
    },
  ): Promise<WebSocketProviderSubscribeResponse>
}

export type WebSocketProviderConfig<TChain extends Chain = Chain> = {
  /** The chain that the provider should connect to. */
  chain: TChain
  /** A key for the provider. Defaults to "webSocket" */
  key?: string
  /** A name for the provider. Defaults to "WebSocket JSON-RPC" */
  name?: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: number
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string
}

export type WebSocketProvider<TChain extends Chain = Chain> =
  NetworkProvider<TChain> & {
    getSocket(): Promise<WebSocket>
    subscribe: WebSocketProviderSubscribe['subscribe']
  }

/**
 * @description Connects to a WebSocket JSON-RPC API via a URL.
 */
export function webSocketProvider<TChain extends Chain = Chain>({
  chain,
  key = 'webSocket',
  name = 'WebSocket JSON-RPC',
  pollingInterval,
  url = chain.rpcUrls.default.webSocket,
}: WebSocketProviderConfig<TChain>): WebSocketProvider<TChain> {
  if (!url) throw new Error('url is required')

  const provider = createNetworkProvider({
    chain,
    key,
    name,
    pollingInterval,
    async request({ method, params }: any) {
      const socket = await getSocket(url)
      const { result } = await new Promise<any>((resolve, reject) =>
        rpc.webSocket(socket, {
          body: {
            method,
            params,
          },
          onData: resolve,
          onError: reject,
        }),
      )
      return result
    },
    transportMode: 'webSocket',
  })

  return {
    ...provider,
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
  }
}
