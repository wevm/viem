import type { PublicRequests } from '../types/eip1193'
import type { Transport } from './transports/createTransport'
import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'
import { publicActions, PublicActions } from './decorators'
import { Chain } from '../types'

export type PublicClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
> = Pick<
  ClientConfig<TTransport, TChain>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
>

export type PublicClient<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TIncludeActions extends boolean = true,
> = Client<TTransport, TChain, PublicRequests> &
  (TIncludeActions extends true ? PublicActions<TChain> : {})

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
export function createPublicClient<
  TTransport extends Transport,
  TChain extends Chain,
>({
  chain,
  key = 'public',
  name = 'Public Client',
  transport,
  pollingInterval,
}: PublicClientConfig<TTransport, TChain>): PublicClient<
  TTransport,
  TChain,
  true
> {
  const client = createClient({
    chain,
    key,
    name,
    pollingInterval,
    transport,
    type: 'publicClient',
  })
  return {
    ...client,
    ...publicActions(client as PublicClient<any, any>),
  }
}
