import type { PublicRequests } from '../types/eip1193.js'
import type { Transport } from './transports/createTransport.js'
import type { Client, ClientConfig } from './createClient.js'
import { createClient } from './createClient.js'
import { publicActions } from './decorators/index.js'
import type { PublicActions } from './decorators/index.js'
import type { Chain, Prettify } from '../types/index.js'

export type PublicClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
> = Pick<
  ClientConfig<TTransport, TChain>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
>

export type PublicClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TIncludeActions extends boolean = true,
> = Prettify<
  Client<TTransport, PublicRequests, TChain> &
    (TIncludeActions extends true ? PublicActions<TTransport, TChain> : unknown)
>

/**
 * @description Creates a public client with a given transport.
 */
export function createPublicClient<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
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
  }) as PublicClient<TTransport, TChain>
  return {
    ...client,
    ...publicActions(client),
  }
}
