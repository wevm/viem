import type { TestRequests } from '../types/eip1193'
import type { Transport } from './transports/createTransport'
import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'

type TestClientModes = 'anvil' | 'hardhat'

export type TestClientConfig<TMode extends TestClientModes = TestClientModes> =
  {
    /** The key of the client. */
    key?: ClientConfig['key']
    /** Mode of the test client. Available: "anvil" | "hardhat" */
    mode: TMode
    /** The name of the client. */
    name?: ClientConfig['name']
    /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
    pollingInterval?: ClientConfig['pollingInterval']
  }

export type TestClient<
  TTransport extends Transport = Transport,
  TMode extends TestClientModes = TestClientModes,
> = Client<TTransport, TestRequests<TMode>> & {
  mode: TMode
}

/**
 * @description Creates a test client with a given transport.
 *
 * - Only has access to "test" RPC methods (ie. `anvil_setBalance`,
 * `evm_mine`, etc).
 *
 * @example
 * import { local } from 'viem/chains'
 * import { createTestClient, http } from 'viem/clients'
 * const client = createTestClient(http({ chain: local }), { mode: 'anvil' })
 */
export function createTestClient<
  TTransport extends Transport,
  TMode extends TestClientModes,
>(
  transport: TTransport,
  {
    key = 'test',
    name = 'Test Client',
    mode,
    pollingInterval,
  }: TestClientConfig<TMode>,
): TestClient<TTransport, TMode> {
  return {
    ...createClient(transport, {
      key,
      name,
      pollingInterval,
      type: 'testClient',
    }),
    mode,
  }
}
