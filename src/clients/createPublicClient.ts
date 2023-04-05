import type { PublicRequests } from '../types/eip1193'
import type { Transport } from './transports/createTransport'
import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'
import { publicActions, PublicActions } from './decorators'
import type { Chain, Prettify } from '../types'

export type PublicClientConfig<
  TChain extends Chain | undefined = Chain | undefined,
  TTransport extends Transport = Transport,
> = Pick<
  ClientConfig<TChain, TTransport>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
>

export type PublicClient<
  TChain extends Chain | undefined = Chain | undefined,
  TTransport extends Transport = Transport,
  TIncludeActions extends boolean = true,
> = Prettify<
  Client<TChain, PublicRequests, TTransport> &
    (TIncludeActions extends true ? PublicActions<TChain, TTransport> : unknown)
>

/**
 * @description Creates a public client with a given transport.
 */
export function createPublicClient<
  TChain extends Chain | undefined = undefined,
  TTransport extends Transport = Transport,
>({
  chain,
  key = 'public',
  name = 'Public Client',
  transport,
  pollingInterval,
}: PublicClientConfig<TChain, TTransport>): PublicClient<
  TChain,
  TTransport,
  true
> {
  const client = createClient({
    chain,
    key,
    name,
    pollingInterval,
    transport,
    type: 'publicClient',
  }) as PublicClient<TChain, TTransport>
  return {
    ...client,
    ...publicActions(client),
  }
}
