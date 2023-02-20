import type { TestRequests } from '../types/eip1193'
import type { Transport } from './transports/createTransport'
import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'
import { Chain } from '../types'
import { testActions, TestActions } from './decorators'

type TestClientModes = 'anvil' | 'hardhat'

export type TestClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TMode extends TestClientModes = TestClientModes,
> = {
  chain?: ClientConfig<TTransport, TChain>['chain']
  /** The key of the client. */
  key?: ClientConfig['key']
  /** Mode of the test client. Available: "anvil" | "hardhat" */
  mode: TMode
  /** The name of the client. */
  name?: ClientConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: ClientConfig['pollingInterval']
  transport: ClientConfig<TTransport, TChain>['transport']
}

export type TestClient<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TMode extends TestClientModes = TestClientModes,
  TIncludeActions extends boolean = true,
> = Client<TTransport, TChain, TestRequests<TMode>> & {
  mode: TMode
} & (TIncludeActions extends true ? TestActions<TChain> : {})

/**
 * @description Creates a test client with a given transport.
 *
 * - Only has access to "test" RPC methods (ie. `anvil_setBalance`,
 * `evm_mine`, etc).
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { local } from 'viem/chains'
 * const client = createTestClient({ chain: local, mode: 'anvil', transport: http() })
 */
export function createTestClient<
  TTransport extends Transport,
  TChain extends Chain,
  TMode extends TestClientModes,
>({
  chain,
  key = 'test',
  name = 'Test Client',
  mode,
  pollingInterval,
  transport,
}: TestClientConfig<TTransport, TChain, TMode>): TestClient<
  TTransport,
  TChain,
  TMode,
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
  }
  return {
    ...client,
    ...testActions(client as TestClient<any, any, any>),
  }
}
