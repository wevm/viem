import type { Address } from 'abitype'
import type { TokenId } from 'ox/tempo'

import type { JsonRpcAccount } from '../accounts/types.js'
import {
  type Client as Client_,
  type ClientConfig as ClientConfig_,
  createClient as createClient_,
} from '../clients/createClient.js'
import {
  type PublicActions,
  publicActions,
} from '../clients/decorators/public.js'
import {
  type WalletActions,
  walletActions,
} from '../clients/decorators/wallet.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { http } from '../clients/transports/http.js'
import type { ErrorType } from '../errors/utils.js'
import { tokens as tokenSets } from '../tokens/sets.js'
import type { Account } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type { RpcSchema } from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import { tempo, tempoTestnet } from './Chain.js'
import { type Decorator, decorator as tempoActions } from './Decorator.js'

/**
 * Configuration for a Tempo {@link Client}.
 *
 * Extends Viem's {@link ClientConfig} with Tempo-specific defaults: `chain`
 * and `transport` become optional, and a `testnet` flag is added to select
 * the Tempo testnet chain.
 */
export type ClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  accountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Omit<
    ClientConfig_<transport, chain, accountOrAddress, rpcSchema>,
    'chain' | 'transport'
  > & {
    /**
     * Chain for the Client.
     *
     * @default tempo (or `tempoTestnet` when `testnet` is truthy)
     */
    chain?: chain | Chain | undefined
    /**
     * Default fee token for the Client. Extended onto the chain so it applies
     * to every transaction sent with the Client.
     */
    feeToken?: TokenId.TokenIdOrAddress | undefined
    /**
     * Whether to use the Tempo testnet chain.
     *
     * Ignored when `chain` is provided.
     *
     * @default false
     */
    testnet?: boolean | undefined
    /**
     * The RPC transport.
     *
     * @default http()
     */
    transport?: transport | Transport | undefined
  }
>

/**
 * A Tempo {@link Client}: Viem's base Client decorated with
 * `publicActions`, `walletActions`, and `tempoActions`.
 */
export type Client<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Client_<
    transport,
    chain,
    account,
    rpcSchema,
    Omit<
      PublicActions<transport, chain, account> & WalletActions<chain, account>,
      'token'
    > &
      Decorator<chain, account>
  >
>

export type CreateClientErrorType = ErrorType

/**
 * Creates a Tempo {@link Client}: an extension of Viem's `createClient`
 * decorated with `publicActions`, `walletActions`, and `tempoActions`.
 *
 * Defaults to the `tempo` mainnet chain and `http` transport, so a minimal
 * client can be created with `createClient()`. Pass `testnet` to use the
 * Tempo testnet, or `chain` to override the chain entirely. Pass `feeToken`
 * to set a default fee token for every transaction.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem/tempo'
 *
 * // Minimal client (tempo mainnet, http transport).
 * const client = createClient()
 * ```
 *
 * @example
 * ```ts
 * import { Account, createClient, http } from 'viem/tempo'
 *
 * // Testnet client with an account and custom transport.
 * const client = createClient({
 *   account: Account.fromSecp256k1('0x...'),
 *   testnet: true,
 *   transport: http('https://rpc.example.com'),
 * })
 * ```
 *
 * @example
 * ```ts
 * import { createClient } from 'viem/tempo'
 *
 * // Client with a default fee token.
 * const client = createClient({
 *   feeToken: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param parameters - Parameters.
 * @returns The Tempo Client.
 */
export function createClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = typeof tempo,
  accountOrAddress extends Account | Address | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: ClientConfig<transport, chain, accountOrAddress, rpcSchema> = {},
): Client<
  transport,
  chain,
  accountOrAddress extends Address
    ? Prettify<JsonRpcAccount<accountOrAddress>>
    : accountOrAddress,
  rpcSchema
> {
  const { chain, feeToken, testnet, tokens, transport, ...rest } = parameters
  const baseChain = chain ?? (testnet ? tempoTestnet : tempo)
  const resolvedChain =
    feeToken && typeof (baseChain as { extend?: unknown }).extend === 'function'
      ? (baseChain as { extend: (e: { feeToken: unknown }) => Chain }).extend({
          feeToken,
        })
      : baseChain
  return createClient_({
    ...rest,
    chain: resolvedChain,
    tokens: tokens ?? tokenSets.tempo,
    transport: transport ?? http(),
  } as ClientConfig_)
    .extend(publicActions)
    .extend(walletActions)
    .extend(tempoActions()) as never
}
