import type { Address, RpcSchema } from 'ox'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import * as viem_Client from '../core/Client.js'
import type * as Token from '../core/Token.js'
import type * as Transport from '../core/Transport.js'
import { publicActions } from '../core/actions/decorators/public.js'
import { walletActions } from '../core/actions/decorators/wallet.js'
import { http } from '../core/transports/http.js'
import { tokens as tokenSets } from '../tokens/sets.js'
import { tempo, tempoModerato } from './Chain.js'
import { type Decorator, tempoActions } from './Decorator.js'

/** A Tempo {@link viem_Client.Client}: the base Client decorated with public, wallet, and Tempo actions. */
export type Client<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
  transport extends Transport.Transport = Transport.Transport,
  tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  schema extends RpcSchema.Generic = RpcSchema.Generic,
> = viem_Client.Client<
  chain,
  account,
  transport,
  tokens,
  schema,
  Omit<
    publicActions.Decorator<chain, account, tokens> &
      walletActions.Decorator<chain, account, tokens>,
    'token'
  > &
    Decorator<chain, account>
>

/**
 * Creates a Tempo {@link Client}: the base Client decorated with
 * `publicActions`, `walletActions`, and `tempoActions`.
 *
 * Defaults to the `tempo` mainnet chain and `http` transport, so a minimal
 * client can be created with `Client.create()`. Pass `testnet` to use the
 * Tempo testnet, or `chain` to override the chain entirely. Pass `feeToken`
 * to set a default fee token for every transaction sent with the Client.
 *
 * @example
 * ```ts
 * import { Client } from 'viem/tempo'
 *
 * // Minimal client (tempo mainnet, http transport).
 * const client = Client.create()
 * ```
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 *
 * // Testnet client with an account and custom transport.
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   testnet: true,
 *   transport: http('https://rpc.example.com'),
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Client } from 'viem/tempo'
 *
 * // Client with a default fee token.
 * const client = Client.create({
 *   feeToken: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param options - Options.
 * @returns The Tempo Client.
 */
export function create<
  chain extends Chain.Chain | undefined = typeof tempo,
  accountOrAddress extends Account.Account | Address.Address | undefined =
    undefined,
  transport extends Transport.Transport = Transport.Transport,
  const tokens extends Token.Tokens | undefined = typeof tokenSets.tempo,
  schema extends RpcSchema.Schema = RpcSchema.Default,
>(
  options?: create.Options<chain, accountOrAddress, transport, tokens, schema>,
): Client<
  chain,
  accountOrAddress extends Address.Address
    ? Account.JsonRpc<accountOrAddress>
    : accountOrAddress,
  transport,
  tokens,
  RpcSchema.ToGeneric<schema>
>

export function create(options: create.Options = {}): viem_Client.Client {
  const { chain, feeToken, testnet, tokens, transport, ...rest } = options
  const baseChain = (chain ?? (testnet ? tempoModerato : tempo)) as
    | (Chain.Chain & {
        extend?: (extended: { feeToken: unknown }) => Chain.Chain
      })
    | undefined
  const resolvedChain =
    feeToken && typeof baseChain?.extend === 'function'
      ? baseChain.extend({ feeToken })
      : baseChain
  return viem_Client
    .create({
      ...rest,
      chain: resolvedChain,
      tokens: tokens ?? tokenSets.tempo,
      transport: transport ?? http(),
    } as viem_Client.create.Options)
    .extend(publicActions())
    .extend(walletActions())
    .extend(tempoActions())
}

export declare namespace create {
  /** Error type for {@link create}. */
  type ErrorType = viem_Client.create.ErrorType

  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    accountOrAddress extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
    transport extends Transport.Transport = Transport.Transport,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
    schema extends RpcSchema.Schema = RpcSchema.Default,
  > = Omit<
    viem_Client.create.Options<
      chain,
      accountOrAddress,
      transport,
      tokens,
      schema
    >,
    'chain' | 'transport'
  > & {
    /**
     * Chain for the Client.
     * @default tempo (or `tempoModerato` when `testnet` is truthy)
     */
    chain?: chain | Chain.Chain | undefined
    /**
     * Default fee token for the Client. Extended onto the chain so it applies
     * to every transaction sent with the Client.
     */
    feeToken?: Address.Address | undefined
    /**
     * Whether to use the Tempo testnet chain. Ignored when `chain` is
     * provided.
     * @default false
     */
    testnet?: boolean | undefined
    /**
     * The RPC transport.
     * @default http()
     */
    transport?: transport | Transport.Transport | undefined
  }
}
