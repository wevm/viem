import { Chain } from '../../chains'
import { BaseProvider, createBaseProvider } from '../createBaseProvider'

export type TransportMode = 'http' | 'webSocket'

export type NetworkProviderConfig<TChain extends Chain = Chain> = Omit<
  BaseProvider<TChain>,
  'chains' | 'type' | 'uniqueId'
> & {
  /** The chain that the provider should connect to. */
  chain: TChain
  /** Transport mode of the provider. */
  transportMode: TransportMode
}

export type NetworkProvider<TChain extends Chain = Chain> =
  BaseProvider<TChain> & {
    chain: TChain
    transportMode: TransportMode
    type: 'networkProvider'
  }

/**
 * @description Creates a provider that is intended to be used as a base for
 * network providers. A network provider performs network requests to an Ethereum
 * node via a JSON-RPC API that the network controls (Alchemy, Infura, Localhost, etc).
 */
export function createNetworkProvider<TChain extends Chain>({
  chain,
  key,
  name,
  request,
  transportMode,
}: NetworkProviderConfig<TChain>): NetworkProvider<TChain> {
  return {
    ...createBaseProvider({
      chains: [chain],
      key,
      name,
      request,
      type: 'networkProvider',
      uniqueId: `${key}.${chain.id}.${transportMode}`,
    }),
    chain,
    transportMode,
  }
}
