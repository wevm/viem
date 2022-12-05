import { TestRequests } from '../types/eip1193'
import { Adapter } from './adapters/createAdapter'
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
  TAdapter extends Adapter = Adapter,
  TKey extends string = string,
> = Client<TAdapter, TestRequests<TKey>>

/**
 * @description Creates a test client with a given adapter.
 *
 * - Only has access to "test" RPC methods (ie. `anvil_setBalance`,
 * `evm_mine`, etc).
 *
 * @example
 * import { local } from 'viem/chains'
 * import { createTestClient, http } from 'viem/clients'
 * const client = createTestClient(http({ chain: local }), { key: 'anvil' })
 */
export function createTestClient<TAdapter extends Adapter, TKey extends string>(
  adapter: TAdapter,
  { key, name = 'Test Client', pollingInterval }: TestClientConfig<TKey>,
): TestClient<TAdapter, TKey> {
  return {
    ...createClient(adapter, {
      key,
      name,
      pollingInterval,
      type: 'testClient',
    }),
  }
}
