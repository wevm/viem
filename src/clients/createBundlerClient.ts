import type { SmartAccount } from '../accounts/types.js'
import type { ErrorType } from '../errors/utils.js'
import type { Chain } from '../types/chain.js'
import type { RpcSchema } from '../types/eip1193.js'
import type { BundlerRpcSchema } from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import {
  type Client,
  type ClientConfig,
  type CreateClientErrorType,
  createClient,
} from './createClient.js'
import { type BundlerActions, bundlerActions } from './decorators/bundler.js'
import type { Transport } from './transports/createTransport.js'

export type BundlerClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Pick<
    ClientConfig<transport, chain, account, rpcSchema>,
    | 'account'
    | 'cacheTime'
    | 'chain'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'rpcSchema'
    | 'transport'
  >
> & {
  client?: client | Client | undefined
}

export type BundlerClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Client<
    transport,
    chain,
    account,
    rpcSchema extends RpcSchema
      ? [...BundlerRpcSchema, ...rpcSchema]
      : BundlerRpcSchema,
    BundlerActions<account>
  >
> & {
  client: client
}

export type CreateBundlerClientErrorType = CreateClientErrorType | ErrorType

/**
 * Creates a Bundler Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/clients/bundler
 *
 * @param config - {@link BundlerClientConfig}
 * @returns A Bundler Client. {@link BundlerClient}
 *
 * @example
 * import { createBundlerClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(window.ethereum),
 * })
 */
export function createBundlerClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  account extends SmartAccount | undefined = undefined,
  client extends Client | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: BundlerClientConfig<transport, chain, account, client, rpcSchema>,
): BundlerClient<transport, chain, account, client, rpcSchema>

export function createBundlerClient(
  parameters: BundlerClientConfig,
): BundlerClient {
  const { key = 'bundler', name = 'Bundler Client', transport } = parameters
  const client = Object.assign(
    createClient({
      ...parameters,
      key,
      name,
      transport,
      type: 'bundlerClient',
    }),
    { client: parameters.client },
  )
  return client.extend(bundlerActions) as any
}
