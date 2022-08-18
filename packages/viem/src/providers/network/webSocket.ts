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
  /** A identifier for the provider. Defaults to "webSocket" */
  id?: string
  /** A name for the provider. Defaults to "WebSocket JSON-RPC" */
  name?: string
  /** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
  url?: string
}

/**
 * @description Connects to a WebSocket JSON-RPC API via a URL.
 */
export function webSocketProvider<TChain extends Chain = Chain>({
  chain,
  id = 'webSocket',
  name = 'WebSocket JSON-RPC',
  url = chain.rpcUrls.default.webSocket,
}: WebSocketProviderConfig<TChain>): WebSocketProvider<TChain> {
  if (!url) throw new Error('url is required')

  const provider = createNetworkProvider({
    chain,
    id,
    name,
    async request({ method, params }: any) {
      const socket = await getSocket(url)
      const { result } = await rpc.webSocket(socket, {
        body: {
          method,
          params,
        },
      })
      return result
    },
    transportMode: 'webSocket',
  })

  return {
    ...provider,
    getSocket: () => getSocket(url),
  }
}
