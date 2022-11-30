import { PublicRequests } from '../types/eip1193'
import { Adapter } from './adapters/createAdapter'
import { Rpc, RpcConfig, createRpc } from './createRpc'

export type NetworkRpcConfig = {
  /** The key of the Network RPC. */
  key?: RpcConfig['key']
  /** The name of the Network RPC. */
  name?: RpcConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: RpcConfig['pollingInterval']
}

export type NetworkRpc<TAdapter extends Adapter = Adapter> = Rpc<
  TAdapter,
  PublicRequests
>

/**
 * @description Creates a network RPC client with a given adapter.
 *
 * - Only has access to "public" EIP-1474 RPC methods (ie. `eth_blockNumber`, etc).
 *
 * @example
 * import { mainnet } from 'viem/chains'
 * import { createNetworkRpc, http } from 'viem/rpcs'
 * const rpc = createNetworkRpc(http({ chain: mainnet }))
 */
export function createNetworkRpc<TAdapter extends Adapter>(
  adapter: TAdapter,
  {
    key = 'network',
    name = 'Network RPC Client',
    pollingInterval,
  }: NetworkRpcConfig = {},
): NetworkRpc<TAdapter> {
  return {
    ...createRpc(adapter, {
      key,
      name,
      pollingInterval,
      type: 'networkRpc',
    }),
  }
}
