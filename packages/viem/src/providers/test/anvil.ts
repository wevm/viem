import { Chain } from '../../chains'
import { TestProvider, createTestProvider } from './createTestProvider'

export type AnvilProviderConfig<TChain extends Chain> = {
  chain: TChain
  url?: string
}

export type AnvilProvider<TChain extends Chain> = TestProvider<TChain, 'anvil'>

/** @description Connects to the Anvil JSON-RPC API via a URL.  */
export function anvilProvider<TChain extends Chain>({
  chain,
  url,
}: AnvilProviderConfig<TChain>): AnvilProvider<TChain> {
  return createTestProvider({
    chain,
    key: 'anvil',
    name: 'Anvil',
    url,
  })
}
