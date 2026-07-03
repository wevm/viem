import type * as TokenId from 'ox/tempo/TokenId'

import * as CoreChain from '../core/Chain.js'
import * as CoreClient from '../core/Client.js'
import { publicActions } from '../core/actions/decorators/public.js'
import { walletActions } from '../core/actions/decorators/wallet.js'
import { http } from '../core/transports/http.js'
import { tokens as tokenSets } from '../tokens/sets.js'
import { tempo, tempoTestnet } from './Chain.js'
import { tempoActions } from './Decorator.js'

/**
 * Creates a Tempo Client: Viem's base Client decorated with
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
 * import { Account } from 'viem'
 * import { Client, http } from 'viem/tempo'
 *
 * // Testnet client with an account and custom transport.
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
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
 */
export function create(config: create.Config = {}): create.ReturnType {
  const {
    chain: chain_,
    feeToken,
    testnet,
    tokens,
    transport,
    ...rest
  } = config
  const base = chain_ ?? (testnet ? tempoTestnet : tempo)
  const chain = feeToken ? CoreChain.from({ ...base, feeToken }) : base
  return CoreClient.create({
    ...rest,
    chain,
    tokens: tokens ?? tokenSets.tempo,
    transport: transport ?? http(),
  } as CoreClient.create.Options)
    .extend(publicActions())
    .extend(walletActions())
    .extend(tempoActions()) as create.ReturnType
}

export declare namespace create {
  type Config = Omit<CoreClient.create.Options, 'chain' | 'transport'> & {
    /** Chain for the Client. @default tempo (or `tempoTestnet` when `testnet` is set) */
    chain?: CoreChain.Chain | undefined
    /**
     * Default fee token for the Client. Extended onto the chain so it applies
     * to every transaction sent with the Client.
     */
    feeToken?: TokenId.TokenIdOrAddress | undefined
    /** Whether to use the Tempo testnet chain. Ignored when `chain` is provided. @default false */
    testnet?: boolean | undefined
    /** The RPC transport. @default http() */
    transport?: CoreClient.create.Options['transport'] | undefined
  }

  type ReturnType = CoreClient.Client &
    ReturnType_<ReturnType_<typeof publicActions>> &
    ReturnType_<ReturnType_<typeof walletActions>> &
    tempoActions.Decorator
}

/** @internal */
type ReturnType_<fn> = fn extends (...args: never[]) => infer returnType
  ? returnType
  : never
