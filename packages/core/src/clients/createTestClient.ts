import { TestRequests } from '../types/eip1193'
import { Transport } from './transports/createTransport'
import { Client, ClientConfig, createClient } from './createClient'

export type TestClientConfig<TKey extends string = string> = {
  /** The key of the Test Client. */
  key: TKey
  /** The name of the Test Client. */
  name?: ClientConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: ClientConfig['pollingInterval']
}

export type TestClient<
  TTransport extends Transport = Transport,
  TKey extends string = string,
> = Client<TTransport, TestRequests<TKey>>

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
  TKey extends string,
>(
  transport: TTransport,
  { key, name = 'Test Client', pollingInterval }: TestClientConfig<TKey>,
): TestClient<TTransport, TKey> {
  return {
    ...createClient(transport, {
      key,
      name,
      pollingInterval,
      type: 'testClient',
    }),
  }
}
