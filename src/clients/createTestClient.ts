import type { Chain } from '../types/chain.js'
import type { TestRequests } from '../types/eip1193.js'

import { type Client, type ClientConfig, createClient } from './createClient.js'
import { type TestActions, testActions } from './decorators/test.js'
import type { Transport } from './transports/createTransport.js'

export type TestClientMode = 'anvil' | 'hardhat'

export type TestClientConfig<
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
> = Pick<
  ClientConfig<TTransport, TChain>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** Mode of the test client. Available: "anvil" | "hardhat" */
  mode: TMode
}

export type TestClient<
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TIncludeActions extends boolean = true,
> = Client<TTransport, TestRequests<TMode>, TChain> &
  (TIncludeActions extends true ? TestActions : unknown) & {
    mode: TMode
  }

/**
 * @description Creates a test client with a given transport.
 */
/**
 * Creates a Test Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/docs/clients/test.html
 *
 * A Test Client is an interface to "test" JSON-RPC API methods accessible through a local Ethereum test node such as [Anvil](https://book.getfoundry.sh/anvil/) or [Hardhat](https://hardhat.org/) such as mining blocks, impersonating accounts, setting fees, etc through [Test Actions](https://viem.sh/docs/actions/test/introduction).
 *
 * @param config - {@link TestClientConfig}
 * @returns A Test Client. {@link TestClient}
 *
 * @example
 * import { createTestClient, custom } from 'viem'
 * import { foundry } from 'viem/chains'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: foundry,
 *   transport: http(),
 * })
 */
export function createTestClient<
  TMode extends TestClientMode,
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
>({
  chain,
  key = 'test',
  name = 'Test Client',
  mode,
  pollingInterval,
  transport,
}: TestClientConfig<TMode, TTransport, TChain>): TestClient<
  TMode,
  TTransport,
  TChain,
  true
> {
  const client = {
    ...createClient({
      chain,
      key,
      name,
      pollingInterval,
      transport,
      type: 'testClient',
    }),
    mode,
  } as TestClient<TMode, TTransport, TChain>
  return {
    ...client,
    ...testActions(client),
  }
}
