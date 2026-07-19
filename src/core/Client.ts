import type { Address, Errors as ox_Errors, RpcSchema } from 'ox'

import type * as CcipRead from '../utils/CcipRead.js'
import * as Account from './Account.js'
import type * as Chain from './Chain.js'
import * as Errors from './Errors.js'
import type * as Token from './Token.js'
import * as Transport from './Transport.js'
import type { DataSuffix } from './internal/dataSuffix.js'
import { uid } from './internal/uid.js'
import type { NoInfer, Prettify } from './internal/types.js'

/**
 * A Viem Client: the composition root binding a {@link Chain} (config/converters), a
 * {@link Transport} (wire), and an optional {@link Account} (signer). Extend it
 * with action decorators via `.extend`.
 */
export type Client<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
  transport extends Transport.Transport = Transport.Transport,
  tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  schema extends RpcSchema.Generic = RpcSchema.Default,
  extended extends Extended | undefined = Extended | undefined,
> = Base<chain, account, transport, tokens, schema> &
  (extended extends Extended ? extended : unknown) & {
    /** Extends the Client with the bag returned by `fn`. */
    extend: <const fn extends Extended>(
      fn: (
        client: Client<chain, account, transport, tokens, schema, extended>,
      ) => fn,
    ) => Client<
      chain,
      account,
      transport,
      tokens,
      schema | ExtractSchema<fn>,
      Prettify<Omit<fn, '~schema'>> &
        (extended extends Extended ? extended : unknown)
    >
  }

type Base<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  transport extends Transport.Transport,
  tokens extends Token.Tokens | undefined,
  schema extends RpcSchema.Generic,
> = {
  /** The Account of the Client (Actions that need a signer default to it). */
  account: account
  /** `eth_call` multicall aggregation flags. */
  batch?: { multicall?: boolean | MulticallOptions | undefined } | undefined
  /** Default block tag for RPC requests. */
  blockTag?: BlockTag | undefined
  /** Time (in ms) cached data stays in memory. */
  cacheTime: number
  /** [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) config. Omitted or `false` disables CCIP Read. */
  ccipRead?: CcipReadOptions | false | undefined
  /** Chain for the Client. */
  chain: chain
  /** Data suffix appended to transaction calldata. */
  dataSuffix?: DataSuffix | undefined
  /** A key for the Client. */
  key: string
  /** A name for the Client. */
  name: string
  /** Polling frequency (ms) for actions & events. */
  pollingInterval: number
  /** Retry/dedupe-wrapped request fn, typed against the resolved `schema`. */
  request: Transport.RequestFn<schema>
  /** Collection of tokens declared on the Client. */
  tokens: tokens
  /** The live transport instance. */
  transport: ReturnType<transport['setup']>
  /** The type of Client. */
  type: string
  /** A unique id for the Client. */
  uid: string
}

/**
 * Extensions may add keys but not redefine base keys. An extension may declare
 * a type-level `~schema` marker (an `RpcSchema.Generic`) to widen the Client's
 * request schema; the marker never exists at runtime.
 */
type Extended = Prettify<
  { [key in keyof Base<any, any, any, any, any>]?: undefined } & {
    [key: string]: unknown
  }
>

/** Request schema declared by an extension's type-level `~schema` marker. */
type ExtractSchema<fn> = fn extends { '~schema'?: infer schema }
  ? Extract<schema, RpcSchema.Generic>
  : never

/** A block tag for RPC requests. */
// TODO: replace with the shared block-tag type once the block module lands.
type BlockTag = 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'

export type { DataSuffix } from './internal/dataSuffix.js'

/** Options for `eth_call` multicall aggregation. */
export type MulticallOptions = {
  /** Max calldata bytes per chunk. @default 1_024 */
  batchSize?: number | undefined
  /** Enable deployless multicall. */
  deployless?: boolean | undefined
  /** Max ms to wait before sending a batch. @default 0 */
  wait?: number | undefined
}

/** [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) configuration. */
export type CcipReadOptions = {
  /** Makes the offchain CCIP lookup request. */
  request: CcipRead.Request
}

/**
 * Creates a {@link Client} from a {@link Transport} and optional {@link Chain}
 * and {@link Account}. `.extend(...)` is the only way to add actions.
 *
 * @example
 * ```ts
 * import { Client, Transport } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: Transport.http(),
 * })
 * ```
 */
export function create<
  chainOrId extends Chain.Chain | number | undefined = undefined,
  accountOrAddress extends Account.Account | Address.Address | undefined =
    undefined,
  transport extends Transport.Transport = Transport.Transport,
  const tokens extends Token.Tokens | undefined = undefined,
  schema extends RpcSchema.Schema = RpcSchema.Default,
>(
  options: create.Options<
    chainOrId,
    accountOrAddress,
    transport,
    tokens,
    schema
  >,
): Client<
  chainOrId extends number ? Chain.Chain & { id: chainOrId } : chainOrId,
  accountOrAddress extends Address.Address
    ? Account.JsonRpc<accountOrAddress>
    : accountOrAddress,
  transport,
  tokens,
  RpcSchema.ToGeneric<schema>
>

export function create(options: create.Options): Client {
  const {
    batch,
    dataSuffix,
    key = 'base',
    name = 'Base Client',
    tokens,
    type = 'base',
  } = options
  const chain =
    typeof options.chain === 'number' ? { id: options.chain } : options.chain
  const ccipRead: CcipReadOptions | false = options.ccipRead ?? {
    async request(options) {
      const { tunnel } = await import('../utils/CcipRead.js')
      return tunnel({
        batchGateways: ['https://ccip-v3.ens.xyz'],
      }).request(options)
    },
  }

  const blockTag =
    options.blockTag ??
    (typeof chain?.preconfirmationTime === 'number' ? 'pending' : undefined)

  const blockTime = chain?.blockTime ?? 12_000
  const pollingInterval =
    options.pollingInterval ??
    Math.min(Math.max(Math.floor(blockTime / 2), 500), 4_000)
  const cacheTime = options.cacheTime ?? pollingInterval

  const account =
    typeof options.account === 'string'
      ? Account.from(options.account)
      : options.account

  const transport = options.transport.setup({
    chain,
    pollingInterval,
    retryCount: options.retryCount,
    timeout: options.timeout,
  })

  const client = {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    dataSuffix,
    key,
    name,
    pollingInterval,
    request: transport.request,
    tokens,
    transport,
    type,
    uid: uid(),
    ...(blockTag ? { blockTag } : {}),
  }

  function extend(base: typeof client) {
    type ExtendFn = (base: typeof client) => Record<string, unknown>
    return (fn: ExtendFn) => {
      const extended = fn(base)
      for (const key in client) delete extended[key]
      delete extended['~schema']
      const combined = merge(base, extended)
      return Object.assign(combined, {
        extend: extend(combined as typeof base),
      })
    }
  }

  return Object.assign(client, { extend: extend(client) }) as unknown as Client
}

/**
 * Creates a resolver that lazily constructs a {@link Client} for each configured
 * {@link Chain}.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 *
 * const resolver = Client.createResolver({
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
 * @param options - Resolver options.
 * @returns A resolver for the configured chains.
 */
export function createResolver<
  const chains extends ResolverChains,
  accountOrAddress extends Account.Account | Address.Address | undefined =
    undefined,
  const transport extends ResolverTransportConfig<NoInfer<chains>> =
    ResolverTransportConfig<NoInfer<chains>>,
  const tokens extends Token.Tokens | undefined = undefined,
  schema extends RpcSchema.Schema = RpcSchema.Default,
>(
  options: createResolver.Options<
    chains,
    accountOrAddress,
    transport,
    tokens,
    schema
  >,
): createResolver.ReturnType<
  chains,
  accountOrAddress,
  transport,
  tokens,
  schema
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
          : (transport as ResolverTransportMap<chains>)[chainId]
      if (!transport_) throw new TransportNotConfiguredError({ chainId })
      const client = create({
        ...rest,
        chain,
        transport: transport_,
      })
      clients.set(chainId, client)
      return client
    },
  } as createResolver.ReturnType<
    chains,
    accountOrAddress,
    transport,
    tokens,
    schema
  >
}

/** Deep-merges decorator namespaces so colliding bags (e.g. `block`) combine. */
function merge(
  base: Record<string, unknown>,
  extended: Record<string, unknown>,
) {
  const result: Record<string, unknown> = { ...base }
  for (const key in extended) {
    const a = result[key]
    const b = extended[key]
    result[key] = isPlainObject(a) && isPlainObject(b) ? merge(a, b) : b
  }
  return result
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export declare namespace create {
  type Options<
    chainOrId extends Chain.Chain | number | undefined =
      | Chain.Chain
      | number
      | undefined,
    accountOrAddress extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
    transport extends Transport.Transport = Transport.Transport,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
    schema extends RpcSchema.Schema = RpcSchema.Default,
  > = {
    /** The Account (or address) to use for Actions that require a signer. */
    account?: accountOrAddress | undefined
    /** `eth_call` multicall aggregation flags. */
    batch?: { multicall?: boolean | MulticallOptions | undefined } | undefined
    /** Default block tag for RPC requests. */
    blockTag?: BlockTag | undefined
    /** Time (in ms) cached data stays in memory. @default pollingInterval */
    cacheTime?: number | undefined
    /** [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) config. `false` disables CCIP Read. @default allowlisted batch gateway */
    ccipRead?: CcipReadOptions | false | undefined
    /** Chain (or chain id) for the Client. */
    chain?: chainOrId | undefined
    /** Data suffix appended to transaction calldata. */
    dataSuffix?: DataSuffix | undefined
    /** A key for the Client. @default 'base' */
    key?: string | undefined
    /** A name for the Client. @default 'Base Client' */
    name?: string | undefined
    /** Polling frequency (ms) for actions & events. */
    pollingInterval?: number | undefined
    /** Per-request retry budget passed through to `transport.setup`. */
    retryCount?: number | undefined
    /** Typed JSON-RPC schema. Accepts an `RpcSchema.Generic` or a Zod namespace (`viem/zod`). */
    schema?: schema | undefined
    /** Per-request timeout (ms) passed through to `transport.setup`. */
    timeout?: number | undefined
    /**
     * Collection of tokens to declare on the Client. A token's symbol becomes
     * usable by `token` actions when its `addresses` cover the Client's chain.
     */
    tokens?: tokens | undefined
    /** The transport for the Client. */
    transport: transport
    /** The type of Client. @default 'base' */
    type?: string | undefined
  }

  type ErrorType = Account.from.ErrorType | ox_Errors.GlobalErrorType
}

type ResolverChains = readonly [Chain.Chain, ...Chain.Chain[]]

type ResolverTransportConfig<chains extends ResolverChains> =
  | ResolverTransportMap<chains>
  | ResolverTransportFactory<chains>

type ResolverTransportFactory<chains extends ResolverChains> = (options: {
  chainId: chains[number]['id']
}) => Transport.Transport

type ResolverTransportMap<chains extends ResolverChains> = {
  readonly [chainId in chains[number]['id']]: Transport.Transport
}

export declare namespace createResolver {
  /** Options for {@link createResolver}. */
  type Options<
    chains extends ResolverChains = ResolverChains,
    accountOrAddress extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
    transport extends ResolverTransportConfig<chains> =
      ResolverTransportConfig<chains>,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
    schema extends RpcSchema.Schema = RpcSchema.Default,
  > = Prettify<
    Omit<
      create.Options<
        undefined,
        accountOrAddress,
        Transport.Transport,
        tokens,
        schema
      >,
      'chain' | 'transport'
    > & {
      /** Chains available to the resolver. */
      chains: chains
      /** Transports indexed or resolved by chain ID. */
      transport: transport
    }
  >

  /** Return type of {@link createResolver}. */
  type ReturnType<
    chains extends ResolverChains = ResolverChains,
    accountOrAddress extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
    transport extends ResolverTransportConfig<chains> =
      ResolverTransportConfig<chains>,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
    schema extends RpcSchema.Schema = RpcSchema.Default,
  > = {
    /** Returns the memoized Client configured for `chainId`. */
    getClient<const chainId extends chains[number]['id']>(options: {
      /** ID of a configured chain. */
      chainId: chainId
    }): Client<
      ResolvedChain<chains, chainId>,
      accountOrAddress extends Address.Address
        ? Account.JsonRpc<accountOrAddress>
        : accountOrAddress,
      ResolvedTransport<chains, transport, chainId>,
      tokens,
      RpcSchema.ToGeneric<schema>
    >
  }

  /** Errors thrown while resolving a Client. */
  type ErrorType =
    | ChainNotConfiguredError
    | TransportNotConfiguredError
    | create.ErrorType
}

type ResolvedChain<
  chains extends ResolverChains,
  chainId extends chains[number]['id'],
> = number extends chains[number]['id']
  ? chains[number]
  : Extract<chains[number], { id: chainId }>

type ResolvedTransport<
  chains extends ResolverChains,
  transport extends ResolverTransportConfig<chains>,
  chainId extends chains[number]['id'],
> = transport extends (...args: never[]) => infer resolved
  ? resolved extends Transport.Transport
    ? resolved
    : never
  : transport extends Record<chainId, infer resolved>
    ? resolved extends Transport.Transport
      ? resolved
      : never
    : never

/** Thrown when a Client is requested for an unconfigured chain. */
export class ChainNotConfiguredError extends Errors.BaseError {
  override readonly name = 'Client.ChainNotConfiguredError'

  constructor({ chainId }: { chainId: number }) {
    super(`Chain with id ${chainId} is not configured.`)
  }
}

/** Thrown when a configured chain has no transport. */
export class TransportNotConfiguredError extends Errors.BaseError {
  override readonly name = 'Client.TransportNotConfiguredError'

  constructor({ chainId }: { chainId: number }) {
    super(`Transport for chain with id ${chainId} is not configured.`)
  }
}
