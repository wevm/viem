import { Chain } from '../../types'
import { rpc } from '../../utils/rpc'
import { NetworkProvider, createNetworkProvider } from './createNetworkProvider'

export type JsonRpcProvider<TChain extends Chain> = NetworkProvider<TChain>

export type JsonRpcProviderConfig<TChain extends Chain> = {
  chains: TChain[]
  url: string
}

export function jsonRpcProvider<TChain extends Chain = Chain>({
  chains,
  url,
}: JsonRpcProviderConfig<TChain>): JsonRpcProvider<TChain> {
  return createNetworkProvider({
    chains,
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
