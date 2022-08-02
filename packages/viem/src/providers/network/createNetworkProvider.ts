import { Chain } from '../../chains'
import { BaseProvider, createBaseProvider } from '../createBaseProvider'

export type NetworkProviderConfig<TChain extends Chain> = Omit<
  BaseProvider<TChain>,
  'chains'
> & {
  /** The chain that the provider should connect to. */
  chain: TChain
}

export type NetworkProvider<TChain extends Chain> = BaseProvider<TChain> & {
  chain: TChain
  type: 'networkProvider'
}

/**
 * @description Creates a provider that is intended to be used as a base for
 * network providers. A network provider performs network requests to an Ethereum
 * node via a JSON-RPC API that the network controls (Alchemy, Infura, Localhost, etc).
 */
export function createNetworkProvider<TChain extends Chain>({
  chain,
  id,
  name,
  request,
}: NetworkProviderConfig<TChain>): NetworkProvider<TChain> {
  return {
    ...createBaseProvider({
      chains: [chain],
      id,
      name,
      request,
    }),
    chain,
    type: 'networkProvider',
  }
}
