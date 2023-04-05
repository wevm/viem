import type { Chain } from '../types'
import type { TestRequests } from '../types/eip1193'
import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'
import { testActions, TestActions } from './decorators'
import type { Transport } from './transports/createTransport'

export type TestClientMode = 'anvil' | 'hardhat'

export type TestClientConfig<
  TMode extends TestClientMode = TestClientMode,
  TChain extends Chain | undefined = Chain | undefined,
  TTransport extends Transport = Transport,
> = Pick<
  ClientConfig<TChain, TTransport>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** Mode of the test client. Available: "anvil" | "hardhat" */
  mode: TMode
}

export type TestClient<
  TMode extends TestClientMode = TestClientMode,
  TChain extends Chain | undefined = Chain | undefined,
  TTransport extends Transport = Transport,
  TIncludeActions extends boolean = true | false,
> = Client<TChain, TestRequests<TMode>, TTransport> &
  (TIncludeActions extends true ? TestActions : unknown) & {
    mode: TMode
  }

/**
 * @description Creates a test client with a given transport.
 */
export function createTestClient<
  TMode extends TestClientMode,
  TChain extends Chain | undefined = undefined,
  TTransport extends Transport = Transport,
>({
  chain,
  key = 'test',
  name = 'Test Client',
  mode,
  pollingInterval,
  transport,
}: TestClientConfig<TMode, TChain, TTransport>): TestClient<
  TMode,
  TChain,
  TTransport,
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
  } as TestClient<TMode, TChain, TTransport>
  return {
    ...client,
    ...testActions(client),
  }
}
