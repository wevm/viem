import type { Address } from 'abitype'

import type { JsonRpcAccount } from '../accounts/types.js'
import { BaseError } from '../errors/base.js'
import type { Tokens } from '../tokens/defineToken.js'
import type { Account } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type { RpcSchema } from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import {
  type Client,
  type ClientConfig,
  type CreateClientErrorType,
  createClient,
} from './createClient.js'
import type { Transport } from './transports/createTransport.js'

/**
 * Creates a resolver that lazily constructs and caches a Client for each configured chain.
 *
 * @example
 * ```ts
 * import { createClientResolver, http } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 *
 * const resolver = createClientResolver({
 *   chains: [mainnet, optimism],
 *   transport: {
 *     [mainnet.id]: http(),
 *     [optimism.id]: http(),
 *   },
 * })
 *
 * const client = resolver.getClient({ chainId: optimism.id })
 * ```
 *
 * @param options - Resolver options, including shared Client configuration.
 * @returns A resolver for the configured chains.
 */
export function createClientResolver<
  const chains extends Chains,
  accountOrAddress extends Account | Address | undefined = undefined,
  const transport extends TransportConfig<NoInfer<chains>> = TransportConfig<
    NoInfer<chains>
  >,
  const tokens extends Tokens | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  options: createClientResolver.Options<
    chains,
    accountOrAddress,
    transport,
    tokens,
    rpcSchema
  >,
): createClientResolver.ReturnType<
  chains,
  accountOrAddress,
  transport,
  tokens,
  rpcSchema
> {
  const { chains, transport, ...rest } = options
  const clients = new Map<number, unknown>()

  // The chain and transport are selected from the same chain ID.
  return {
    getClient({ chainId }) {
      const cached = clients.get(chainId)
      if (cached) return cached

      const chain = chains.find((chain) => chain.id === chainId)
      if (!chain) throw new ChainNotConfiguredError({ chainId })
      const transport_ =
        typeof transport === 'function'
          ? transport({ chainId })
          : (transport as TransportMap<chains>)[chainId]
      if (!transport_) throw new TransportNotConfiguredError({ chainId })
      const client = createClient({ ...rest, chain, transport: transport_ })
      clients.set(chainId, client)
      return client
    },
  } as createClientResolver.ReturnType<
    chains,
    accountOrAddress,
    transport,
    tokens,
    rpcSchema
  >
}

export declare namespace createClientResolver {
  /** Errors thrown while resolving a Client. */
  type ErrorType =
    | ChainNotConfiguredError
    | CreateClientErrorType
    | TransportNotConfiguredError

  /** Options for {@link createClientResolver}. */
  type Options<
    chains extends Chains = Chains,
    accountOrAddress extends Account | Address | undefined =
      | Account
      | Address
      | undefined,
    transport extends TransportConfig<chains> = TransportConfig<chains>,
    tokens extends Tokens | undefined = Tokens | undefined,
    rpcSchema extends RpcSchema | undefined = undefined,
  > = Prettify<
    Omit<
      ClientConfig<Transport, undefined, accountOrAddress, rpcSchema, tokens>,
      'chain' | 'transport'
    > & {
      /** Chains available to the resolver. Must contain at least one chain. */
      chains: chains
      /** Transports indexed or resolved by chain ID. */
      transport: transport
    }
  >

  /** Return type of {@link createClientResolver}. */
  type ReturnType<
    chains extends Chains = Chains,
    accountOrAddress extends Account | Address | undefined =
      | Account
      | Address
      | undefined,
    transport extends TransportConfig<chains> = TransportConfig<chains>,
    tokens extends Tokens | undefined = Tokens | undefined,
    rpcSchema extends RpcSchema | undefined = undefined,
  > = {
    /** Returns the cached Client configured for `chainId`, creating it on first use. */
    getClient<const chainId extends chains[number]['id']>(options: {
      /** ID of a configured chain. */
      chainId: chainId
    }): Client<
      ResolvedTransport<chains, transport, chainId>,
      number extends chains[number]['id']
        ? chains[number]
        : Extract<chains[number], { id: chainId }>,
      accountOrAddress extends Address
        ? Prettify<JsonRpcAccount<accountOrAddress>>
        : accountOrAddress,
      rpcSchema,
      undefined,
      tokens
    >
  }
}

type Chains = readonly [Chain, ...Chain[]]

type TransportConfig<chains extends Chains> =
  | TransportMap<chains>
  | ((options: { chainId: chains[number]['id'] }) => Transport)

type TransportMap<chains extends Chains> = {
  readonly [chainId in chains[number]['id']]: Transport
}

type ResolvedTransport<
  chains extends Chains,
  transport extends TransportConfig<chains>,
  chainId extends chains[number]['id'],
> = transport extends (...args: never[]) => infer resolved
  ? resolved extends Transport
    ? resolved
    : never
  : transport extends Record<chainId, infer resolved>
    ? resolved extends Transport
      ? resolved
      : never
    : never

/** Thrown when a Client is requested for an unconfigured chain. */
export class ChainNotConfiguredError extends BaseError {
  constructor({ chainId }: { chainId: number }) {
    super(`Chain with id ${chainId} is not configured.`, {
      name: 'createClientResolver.ChainNotConfiguredError',
    })
  }
}

/** Thrown when a configured chain has no transport. */
export class TransportNotConfiguredError extends BaseError {
  constructor({ chainId }: { chainId: number }) {
    super(`Transport for chain with id ${chainId} is not configured.`, {
      name: 'createClientResolver.TransportNotConfiguredError',
    })
  }
}
