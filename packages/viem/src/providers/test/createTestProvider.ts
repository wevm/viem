import { Chain } from '../../chains'
import { TestRequests } from '../../types/ethereum-provider'
import { rpc } from '../../utils'
import { BaseProvider, createBaseProvider } from '../createBaseProvider'

export type TestProviderId = 'anvil' | 'hardhat'

export type TestProviderConfig<
  TChain extends Chain,
  TId extends TestProviderId,
> = {
  /** The chain that the provider should connect to. */
  chain: TChain
  /** A identifier for the provider. */
  id: TId
  /** A name for the provider. */
  name: string
  /** URL of the test node. */
  url?: string
}

export type TestProvider<
  TChain extends Chain = Chain,
  TId extends TestProviderId = TestProviderId,
> = BaseProvider<TChain, TestRequests<TId>['request'], TId> & {
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
  TId extends TestProviderId,
>({
  chain: chain_,
  id,
  name,
  url = chain_.rpcUrls.local?.http,
}: TestProviderConfig<TChain, TId>): TestProvider<TChain, TId> {
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
      id,
      name,
      async request({ method, params }: any) {
        const { result } = await rpc.http(url, {
          body: {
            method,
            params,
          },
        })
        return result
      },
    }),
    chain,
    type: 'testProvider',
  }
}
