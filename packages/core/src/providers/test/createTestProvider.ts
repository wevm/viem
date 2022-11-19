import { Chain } from '../../chains'
import { TestRequests } from '../../types/ethereum-provider'
import { rpc } from '../../utils'
import { BaseProvider, createBaseProvider } from '../createBaseProvider'

export type TestProviderKey = 'anvil' | 'hardhat'

export type TestProviderConfig<
  TChain extends Chain,
  TKey extends TestProviderKey,
> = {
  /** The chain that the provider should connect to. */
  chain: TChain
  /** A key for the provider. */
  key: TKey
  /** A name for the provider. */
  name: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: number
  /** URL of the test node. */
  url?: string
}

export type TestProvider<
  TChain extends Chain = Chain,
  TKey extends TestProviderKey = TestProviderKey,
> = BaseProvider<TChain, TestRequests<TKey>, TKey> & {
  chain: TChain
  type: 'testProvider'
}

/**
 * @description Creates a provider that is intended to be used as a base for
 * test providers. A test provider connects to a local test node such as Anvil or
 * Hardhat.
 */
export function createTestProvider<
  TChain extends Chain,
  TKey extends TestProviderKey,
>({
  chain: chain_,
  key,
  name,
  pollingInterval,
  url = chain_.rpcUrls.local?.http,
}: TestProviderConfig<TChain, TKey>): TestProvider<TChain, TKey> {
  if (!url) throw new Error('url is required')
  const chain: typeof chain_ = {
    ...chain_,
    rpcUrls: {
      ...chain_.rpcUrls,
      local: url,
    },
  }
  return {
    ...createBaseProvider({
      chains: [chain],
      key,
      name,
      pollingInterval,
      async request({ method, params }: any) {
        const { result } = await rpc.http(url, {
          body: {
            method,
            params,
          },
        })
        return result
      },
      type: 'testProvider',
      uniqueId: `${key}.${chain.id}`,
    }),
    chain,
  }
}
