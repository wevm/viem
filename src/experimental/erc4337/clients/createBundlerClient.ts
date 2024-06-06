import type { Address } from 'abitype'

import type { Account } from '../../../accounts/types.js'
import {
  type Client,
  type ClientConfig,
  type CreateClientErrorType,
  createClient,
} from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { ParseAccount } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { RpcSchema } from '../../../types/eip1193.js'
import type { Prettify } from '../../../types/utils.js'
import type { BundlerRpcSchema } from '../types/eip1193.js'
import type { EntryPointVersion } from '../types/entryPointVersion.js'
import { type BundlerActions, bundlerActions } from './decorators/bundler.js'

export type BundlerClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  accountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  entryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Pick<
    ClientConfig<transport, chain, accountOrAddress, rpcSchema>,
    | 'cacheTime'
    | 'chain'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'rpcSchema'
    | 'transport'
  > & {
    entryPointVersion?: entryPointVersion
  }
>

export type BundlerClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  entryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Client<
    transport,
    chain,
    account,
    rpcSchema extends RpcSchema
      ? [...BundlerRpcSchema, ...rpcSchema]
      : BundlerRpcSchema,
    BundlerActions & { entryPointVersion: entryPointVersion }
  >
>

export type CreateBundlerClientErrorType = CreateClientErrorType | ErrorType

/**
 * Creates a Wallet Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/erc4337/clients/bundler
 *
 * A Wallet Client is an interface to interact with [Ethereum Account(s)](https://ethereum.org/en/glossary/#account) and provides the ability to retrieve accounts, execute transactions, sign messages, etc. through [Wallet Actions](https://viem.sh/docs/actions/wallet/introduction).
 *
 * @param config - {@link BundlerClientConfig}
 * @returns A Wallet Client. {@link BundlerClient}
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
  accountOrAddress extends Account | Address | undefined = undefined,
  entryPointVersion extends EntryPointVersion | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: BundlerClientConfig<
    transport,
    chain,
    accountOrAddress,
    entryPointVersion,
    rpcSchema
  >,
): BundlerClient<
  transport,
  chain,
  ParseAccount<accountOrAddress>,
  entryPointVersion,
  rpcSchema
>

export function createBundlerClient(
  parameters: BundlerClientConfig,
): BundlerClient {
  const {
    entryPointVersion,
    key = 'bundler',
    name = 'Bundler Client',
    transport,
  } = parameters
  const client = createClient({
    ...parameters,
    key,
    name,
    transport,
    type: 'bundlerClient',
  })
  return client
    .extend(() => ({ entryPointVersion }))
    .extend(bundlerActions()) as BundlerClient
}
