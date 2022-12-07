import type { TestRequests } from '../types/eip1193'
import type { Transport } from './transports/createTransport'
import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'

type TestClientTypes = 'anvil' | 'hardhat'

export type TestClientConfig<TMode extends TestClientTypes = TestClientTypes> =
  {
    /** The key of the client. */
    key?: ClientConfig['key']
    /** The name of the client. */
    name?: ClientConfig['name']
    /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
    pollingInterval?: ClientConfig['pollingInterval']
    /** Mode of the test client. Available: "anvil" | "hardhat" */
    mode: TMode
  }

export type TestClient<
  TTransport extends Transport = Transport,
  TType extends TestClientTypes = TestClientTypes,
> = Omit<Client<TTransport, TestRequests<TType>>, 'key'> & {
  mode: TType
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
 * const client = createTestClient(http({ chain: local }), { key: 'anvil' })
 */
export function createTestClient<
  TTransport extends Transport,
  TType extends TestClientTypes,
>(
  transport: TTransport,
  { key, name = 'Test Client', mode, pollingInterval }: TestClientConfig<TType>,
): TestClient<TTransport, TType> {
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
