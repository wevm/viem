import { rpc } from '../../utils/rpc'
import { NetworkProvider, createNetworkProvider } from './createNetworkProvider'

export type JsonRpcProvider = NetworkProvider

export type JsonRpcProviderConfig = {
  url: string
}

export function jsonRpcProvider({
  url,
}: JsonRpcProviderConfig): JsonRpcProvider {
  return createNetworkProvider({
    async request({ method, params }: any) {
      const { result } = await rpc.http(url, {
        body: {
          method,
          params,
        },
      })
      return result
    },
  })
}
