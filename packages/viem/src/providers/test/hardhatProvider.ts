import { Chain } from '../../chains'
import { TestProvider, createTestProvider } from './createTestProvider'

export type HardhatProviderConfig<TChain extends Chain> = {
  chain: TChain
  url?: string
}

export type HardhatProvider<TChain extends Chain> = TestProvider<
  TChain,
  'hardhat'
>

/** @description Connects to the Hardhat JSON-RPC API via a URL.  */
export function hardhatProvider<TChain extends Chain>({
  chain,
  url,
}: HardhatProviderConfig<TChain>): HardhatProvider<TChain> {
  return createTestProvider({
    chain,
    id: 'hardhat',
    name: 'Hardhat',
    url,
  })
}
