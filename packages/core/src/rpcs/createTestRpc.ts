import { TestRequests } from '../types/eip1193'
import { Adapter } from './adapters/createAdapter'
import { Rpc, RpcConfig, createRpc } from './createRpc'

export type TestRpcConfig<TKey extends string = string> = {
  /** The key of the Test RPC. */
  key: TKey
  /** The name of the Test RPC. */
  name?: RpcConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: RpcConfig['pollingInterval']
}

export type TestRpc<
  TAdapter extends Adapter = Adapter,
  TKey extends string = string,
> = Rpc<TAdapter, TestRequests<TKey>>

/**
 * @description Creates a test RPC client with a given adapter.
 *
 * - Only has access to "test" RPC methods (ie. `anvil_setBalance`,
 * `evm_mine`, etc).
 *
 * @example
 * import { local } from 'viem/chains'
 * import { createTestRpc, http } from 'viem/rpcs'
 * const rpc = createTestRpc(http({ chain: local }), { key: 'anvil' })
 */
export function createTestRpc<TAdapter extends Adapter, TKey extends string>(
  adapter: TAdapter,
  { key, name = 'Test RPC Client', pollingInterval }: TestRpcConfig<TKey>,
): TestRpc<TAdapter, TKey> {
  return {
    ...createRpc(adapter, {
      key,
      name,
      pollingInterval,
      type: 'testRpc',
    }),
  }
}
