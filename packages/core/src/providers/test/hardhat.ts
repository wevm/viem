import { Chain } from '../../chains'
import { TestProvider, createTestProvider } from './createTestProvider'

export type HardhatProviderConfig<TChain extends Chain> = {
  chain: TChain
  pollingInterval?: number
  url?: string
}

export type HardhatProvider<TChain extends Chain> = TestProvider<
  TChain,
  'hardhat'
>

/** @description Connects to the Hardhat JSON-RPC API via a URL.  */
export function hardhatProvider<TChain extends Chain>({
  chain,
  pollingInterval,
  url,
}: HardhatProviderConfig<TChain>): HardhatProvider<TChain> {
  return createTestProvider({
    chain,
    key: 'hardhat',
    name: 'Hardhat',
    pollingInterval,
    url,
  })
}
