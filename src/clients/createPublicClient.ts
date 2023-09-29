import type { ErrorType } from '../errors/utils.js'
import type { Chain } from '../types/chain.js'
import type { PublicRpcSchema } from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import {
  type Client,
  type ClientConfig,
  type CreateClientErrorType,
  createClient,
} from './createClient.js'
import { type PublicActions, publicActions } from './decorators/public.js'
import type { Transport } from './transports/createTransport.js'

export type PublicClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
> = Prettify<
  Pick<
    ClientConfig<transport, chain>,
    | 'batch'
    | 'cacheTime'
    | 'chain'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'transport'
  >
>

export type PublicClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
> = Prettify<
  Client<
    transport,
    chain,
    undefined,
    PublicRpcSchema,
    PublicActions<transport, chain>
  >
>

export type CreatePublicClientErrorType = CreateClientErrorType | ErrorType

/**
 * Creates a Public Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * - Docs: https://viem.sh/docs/clients/public.html
 *
 * A Public Client is an interface to "public" [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).
 *
 * @param config - {@link PublicClientConfig}
 * @returns A Public Client. {@link PublicClient}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
export function createPublicClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
>(
  parameters: PublicClientConfig<transport, chain>,
): PublicClient<transport, chain>

export function createPublicClient(
  parameters: PublicClientConfig,
): PublicClient {
  const { key = 'public', name = 'Public Client' } = parameters
  const client = createClient({
    ...parameters,
    key,
    name,
    type: 'publicClient',
  })
  return client.extend(publicActions)
}
