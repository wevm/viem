import { PublicRequests } from '../types/eip1193'
import { Adapter } from './adapters/createAdapter'
import { Client, ClientConfig, createClient } from './createClient'

export type NetworkClientConfig = {
  /** The key of the Network Client. */
  key?: ClientConfig['key']
  /** The name of the Network Client. */
  name?: ClientConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: ClientConfig['pollingInterval']
}

export type NetworkClient<TAdapter extends Adapter = Adapter> = Client<
  TAdapter,
  PublicRequests
>

/**
 * @description Creates a network client with a given adapter.
 *
 * - Only has access to "public" EIP-1474 RPC methods (ie. `eth_blockNumber`, etc).
 *
 * @example
 * import { mainnet } from 'viem/chains'
 * import { createNetworkClient, http } from 'viem/clients'
 * const client = createNetworkClient(http({ chain: mainnet }))
 */
export function createNetworkClient<TAdapter extends Adapter>(
  adapter: TAdapter,
  {
    key = 'network',
    name = 'Network Client',
    pollingInterval,
  }: NetworkClientConfig = {},
): NetworkClient<TAdapter> {
  return {
    ...createClient(adapter, {
      key,
      name,
      pollingInterval,
      type: 'networkClient',
    }),
  }
}
