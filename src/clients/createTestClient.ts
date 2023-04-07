import type { Chain } from '../types/index.js'
import type { TestRequests } from '../types/eip1193.js'
import type { Client, ClientConfig } from './createClient.js'
import { createClient } from './createClient.js'
import { testActions } from './decorators/index.js'
import type { TestActions } from './decorators/index.js'
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
