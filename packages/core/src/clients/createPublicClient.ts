import type { PublicRequests } from '../types/eip1193'
import type { Transport } from './transports/createTransport'
import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'

export type PublicClientConfig = {
  /** The key of the Network Client. */
  key?: ClientConfig['key']
  /** The name of the Network Client. */
  name?: ClientConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: ClientConfig['pollingInterval']
}

export type PublicClient<TTransport extends Transport = Transport> = Client<
  TTransport,
  PublicRequests
>

/**
 * @description Creates a public client with a given transport.
 *
 * - Only has access to "public" EIP-1474 RPC methods (ie. `eth_blockNumber`, etc).
 *
 * @example
 * import { mainnet } from 'viem/chains'
 * import { createPublicClient, http } from 'viem/clients'
 * const client = createPublicClient(http({ chain: mainnet }))
 */
export function createPublicClient<TTransport extends Transport>(
  transport: TTransport,
  {
    key = 'public',
    name = 'Public Client',
    pollingInterval,
  }: PublicClientConfig = {},
): PublicClient<TTransport> {
  return {
    ...createClient(transport, {
      key,
      name,
      pollingInterval,
      type: 'publicClient',
    }),
  }
}
