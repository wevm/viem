import { Chain } from '../../chains'
import { getSocket, rpc } from '../../utils/rpc'
import { NetworkProvider, createNetworkProvider } from './createNetworkProvider'

export type WebSocketProvider<TChain extends Chain = Chain> =
  NetworkProvider<TChain> & {
    getSocket(): Promise<WebSocket>
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
    getSocket: () => getSocket(url),
  }
}
