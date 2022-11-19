import { Chain } from '../../chains'
import { TestProvider, createTestProvider } from './createTestProvider'

export type AnvilProviderConfig<TChain extends Chain> = {
  chain: TChain
  pollingInterval?: number
  url?: string
}

export type AnvilProvider<TChain extends Chain> = TestProvider<TChain, 'anvil'>

/** @description Connects to the Anvil JSON-RPC API via a URL.  */
export function anvilProvider<TChain extends Chain>({
  chain,
  pollingInterval,
  url,
}: AnvilProviderConfig<TChain>): AnvilProvider<TChain> {
  return createTestProvider({
    chain,
    key: 'anvil',
    name: 'Anvil',
    pollingInterval,
    url,
  })
}
