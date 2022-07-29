import { Chain } from '../../types'
import { BaseProvider, createBaseProvider } from '../createBaseProvider'

export type NetworkProvider<TChain extends Chain> = BaseProvider<TChain>

export function createNetworkProvider<TChain extends Chain>({
  chains,
  request,
}: NetworkProvider<TChain>): NetworkProvider<TChain> {
  return createBaseProvider({
    chains,
    request,
  })
}
