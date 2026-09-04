import {
  type Address,
  type Errors as ox_Errors,
  Provider,
  type RpcSchema,
} from 'ox'

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

/**
 * Creates a v3 {@link Client} from a v2-compatible base Client. The returned
 * Client forwards requests through the v2 Client and can be extended with v3
 * action decorators.
 *
 * The adapted Client derives its Chain from the source chain ID and carries
 * only JSON-RPC Accounts by default. Pass v3-native values to preserve full
 * Chain or Account behavior.
 * The returned Client owns retries: forwarded requests disable the v2 Client's
 * retry layer. Forwarded errors are normalized with `Provider.parseError`.
 *
 * @example
 * ```ts
 * import { createClient as createClientV2, http as httpV2 } from 'viem'
 * import { Client, publicActions } from 'viem-v3'
 *
 * const clientV2 = createClientV2({ transport: httpV2() })
 * const publicClient = Client.fromV2(clientV2).extend(publicActions())
 * ```
 *
 * @param client - The v2-compatible base Client.
 * @param options - Optional v3 Chain and Account overrides.
 * @returns A v3 Client.
 */
export function fromV2<
  const source extends V2SourceClient,
  chainOrId extends Chain.Chain | number | undefined = never,
  accountOrAddress extends Account.Account | Address.Address | undefined =
    never,
>(
  client: source,
  options: fromV2.Options<chainOrId, accountOrAddress> = {},
): fromV2.ReturnType<
  V2ResolveChain<source['chain'], chainOrId>,
  V2ResolveAccount<source['account'], accountOrAddress>
> {
  const chain = (
    'chain' in options ? options.chain : client.chain?.id
  ) as V2ResolveChain<source['chain'], chainOrId>
  const account = (
    'account' in options
      ? options.account
      : client.account?.type === 'json-rpc'
        ? client.account
        : undefined
  ) as V2ResolveAccount<source['account'], accountOrAddress>
  const request = client.request as unknown as V2Request

  const transport = Transport.from({
    key: 'v2',
    name: 'Viem v2 Client',
    type: 'custom',
    setup() {
      return {
        async request(parameters, options) {
          try {
            return await request(parameters, { ...options, retryCount: 0 })
          } catch (error) {
            throw Provider.parseError(error)
          }
        },
      }
    },
  })

  // The runtime branches above mirror the conditional target types.
  return create({
    account,
    batch: client.batch,
    blockTag: client.experimental_blockTag,
    cacheTime: client.cacheTime,
    ccipRead: client.ccipRead === false ? false : undefined,
    chain,
    dataSuffix: client.dataSuffix,
    key: client.key,
    name: client.name,
    pollingInterval: client.pollingInterval,
    transport,
    type: client.type,
  }) as unknown as Client<
    V2ResolveChain<source['chain'], chainOrId>,
    V2ResolveAccount<source['account'], accountOrAddress>,
    Transport.Transport<'custom'>
  >
}

export declare namespace fromV2 {
  /** Options for {@link fromV2}. */
  type Options<
    chainOrId extends Chain.Chain | number | undefined = never,
    accountOrAddress extends Account.Account | Address.Address | undefined =
      never,
  > = {
    /** v3 Account or address to use instead of the v2 Client's Account. */
    account?: accountOrAddress | undefined
    /** v3 Chain or chain ID to use instead of the v2 Client's chain ID. */
    chain?: chainOrId | undefined
  }

  /** Return type of {@link fromV2}. */
  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
  > = Client<chain, account, Transport.Transport<'custom'>>

  /** Errors thrown while adapting a v2 Client. */
  type ErrorType = create.ErrorType | ox_Errors.GlobalErrorType
}

/**
 * Creates a v2-compatible base Client from a v3 {@link Client}. Extend the
 * result with v2 action decorators to create a v2 Public, Wallet, or custom
 * Client.
 *
 * The one-argument form creates a chainless Client and only preserves
 * JSON-RPC Accounts. Pass v2-native values to preserve full Chain or local
 * Account behavior. Requests preserve the v3 Client's error identities.
 *
 * @example
 * ```ts
 * import { publicActions as publicActionsV2 } from 'viem'
 * import { Client, http } from 'viem-v3'
 *
 * const client = Client.create({ transport: http() })
 * const publicClientV2 = Client.toV2(client).extend(publicActionsV2)
 * ```
 *
 * @param client - The v3 Client.
 * @param options - Optional v2 Chain and Account overrides.
 * @returns A v2-compatible base Client.
 */
export function toV2<
  const source extends Client,
  chain extends V2Chain | undefined = never,
  account extends V2Account | undefined = never,
>(
  client: source,
  options: toV2.Options<chain, account> = {},
): toV2.ReturnType<
  V2ResolveTargetChain<chain>,
  V2ResolveTargetAccount<source['account'], account>
> {
  const request = client.request as unknown as V2Request
  const account = (
    'account' in options
      ? options.account
      : client.account?.type === 'json-rpc'
        ? client.account
        : undefined
  ) as V2ResolveTargetAccount<source['account'], account>

  const base: V2Base<
    V2ResolveTargetChain<chain>,
    V2ResolveTargetAccount<source['account'], account>
  > = {
    account,
    batch: client.batch,
    cacheTime: client.cacheTime,
    ccipRead: client.ccipRead === false ? false : undefined,
    chain: options.chain as V2ResolveTargetChain<chain>,
    dataSuffix: client.dataSuffix,
    experimental_blockTag: client.blockTag,
    key: client.key,
    name: client.name,
    pollingInterval: client.pollingInterval,
    request,
    tokens: undefined,
    transport: {
      key: 'custom',
      name: 'Viem v3 Client',
      request,
      retryCount: 0,
      type: 'custom',
    },
    type: client.type,
    uid: uid(),
  }

  return withV2Extend(base)
}

export declare namespace toV2 {
  /** Options for {@link toV2}. */
  type Options<
    chain extends V2Chain | undefined = never,
    account extends V2Account | undefined = never,
  > = {
    /** v2 JSON-RPC or local Account to use instead of the v3 Client's Account. */
    account?: account | undefined
    /** v2 Chain to attach to the adapted Client. */
    chain?: chain | undefined
  }

  /** Return type of {@link toV2}. */
  type ReturnType<
    chain extends V2Chain | undefined = undefined,
    account extends V2Account | undefined = undefined,
  > = V2Client<chain, account, undefined>
}

type V2Base<
  chain extends V2Chain | undefined,
  account extends V2Account | undefined,
> = {
  /** The Account of the Client. */
  account: account
  /** `eth_call` multicall aggregation flags. */
  batch?: { multicall?: boolean | MulticallOptions | undefined } | undefined
  /** Time (in ms) cached data stays in memory. */
  cacheTime: number
  /** Whether CCIP Read is disabled. */
  ccipRead?: false | undefined
  /** Chain for the Client. */
  chain: chain
  /** Data suffix appended to transaction calldata. */
  dataSuffix?: DataSuffix | undefined
  /** Default block tag for RPC requests. */
  experimental_blockTag?: BlockTag | undefined
  /** A key for the Client. */
  key: string
  /** A name for the Client. */
  name: string
  /** Polling frequency (ms) for actions and events. */
  pollingInterval: number
  /** Request function forwarded to the v3 Client. */
  request: V2Request
  /** Token functions are not adapted between versions. */
  tokens: undefined
  /** Synthetic custom transport backed by the v3 Client. */
  transport: V2Transport
  /** The type of Client. */
  type: string
  /** A unique id for the Client. */
  uid: string
}

type V2Extended = Prettify<
  { [key in keyof V2Base<any, any>]?: undefined } & {
    [key: string]: unknown
  }
>

type V2Client<
  chain extends V2Chain | undefined,
  account extends V2Account | undefined,
  extended extends V2Extended | undefined,
> = V2Base<chain, account> &
  (extended extends V2Extended ? extended : unknown) & {
    /**
     * Extends the Client with a v2 decorator. The installed v2 Client type
     * supplies target-version protected-action constraints.
     */
    extend: <const extension extends V2Extended>(
      fn: (client: V2Client<chain, account, extended>) => extension,
    ) => V2Client<
      chain,
      account,
      Prettify<extension> & (extended extends V2Extended ? extended : unknown)
    >
  }

function withV2Extend<
  chain extends V2Chain | undefined,
  account extends V2Account | undefined,
>(client: V2Base<chain, account>): V2Client<chain, account, undefined> {
  function extend(base: Record<string, unknown>) {
    return (
      fn: (client: Record<string, unknown>) => Record<string, unknown>,
    ) => {
      const extended = fn(base)
      for (const key in client) delete extended[key]
      const combined = { ...base, ...extended }
      for (const key in extended) {
        const a = base[key]
        const b = extended[key]
        if (isPlainObject(a) && isPlainObject(b)) combined[key] = { ...a, ...b }
      }
      return Object.assign(combined, { extend: extend(combined) })
    }
  }

  const base = client as unknown as Record<string, unknown>
  return Object.assign(base, {
    extend: extend(base),
  }) as V2Client<chain, account, undefined>
}

type V2Account = V2JsonRpcAccount | V2LocalAccount

type V2JsonRpcAccount = {
  address: Address.Address
  type: 'json-rpc'
}

type V2LocalAccount = {
  address: Address.Address
  nonceManager?: object | undefined
  publicKey: `0x${string}`
  sign?: V2SignFn | undefined
  signAuthorization?: V2SignFn | undefined
  signMessage: V2SignFn
  signTransaction: V2SignFn
  signTypedData: V2SignFn
  source: string
  type: 'local'
}

type V2Chain = {
  id: number
  name: string
  nativeCurrency: {
    decimals: number
    name: string
    symbol: string
  }
  rpcUrls: {
    [key: string]: V2RpcUrls
    default: V2RpcUrls
  }
}

type V2RpcUrls = {
  http: readonly string[]
  webSocket?: readonly string[] | undefined
}

type V2RequestOptions = {
  dedupe?: boolean | undefined
  methods?:
    | { include?: string[] | undefined }
    | { exclude?: string[] | undefined }
    | undefined
  retryDelay?: number | undefined
  retryCount?: number | undefined
  signal?: AbortSignal | undefined
  uid?: string | undefined
}

type V2Request = <
  schemaOverride extends V2RequestOverride | undefined = undefined,
  parameters extends V2RequestParameters = V2RequestParameters,
  returnType = schemaOverride extends { ReturnType: infer returnType }
    ? returnType
    : unknown,
>(
  parameters: parameters,
  options?: V2RequestOptions | undefined,
) => Promise<returnType>

type V2RequestOverride = {
  Parameters?: unknown | undefined
  ReturnType: unknown
}

type V2RequestParameters = {
  method: string
  params?: unknown | undefined
}

type V2SourceClient<
  chain extends { id: number } | undefined = { id: number } | undefined,
  account extends V2SourceAccount | undefined = V2SourceAccount | undefined,
> = {
  account: account
  batch?: { multicall?: boolean | MulticallOptions | undefined } | undefined
  cacheTime: number
  ccipRead?: object | false | undefined
  chain: chain
  dataSuffix?: DataSuffix | undefined
  experimental_blockTag?: BlockTag | undefined
  key: string
  name: string
  pollingInterval: number
  request: (...args: never[]) => Promise<unknown>
  type: string
}

type V2SourceAccount = {
  address: Address.Address
  type: string
}

type V2SignFn = (...args: never[]) => Promise<unknown>

type V2Transport = {
  key: string
  methods?:
    | { include?: string[] | undefined }
    | { exclude?: string[] | undefined }
    | undefined
  name: string
  request: V2Request
  retryCount?: number | undefined
  retryDelay?: number | undefined
  timeout?: number | undefined
  type: 'custom'
}

type V2ResolveAccount<
  account extends V2SourceAccount | undefined,
  accountOrAddress extends Account.Account | Address.Address | undefined,
> = [accountOrAddress] extends [never]
  ? account extends {
      address: infer address extends Address.Address
      type: 'json-rpc'
    }
    ? Account.JsonRpc<address>
    : undefined
  : accountOrAddress extends Address.Address
    ? Account.JsonRpc<accountOrAddress>
    : accountOrAddress

type V2ResolveChain<
  chain extends { id: number } | undefined,
  chainOrId extends Chain.Chain | number | undefined,
> = [chainOrId] extends [never]
  ? chain extends { id: infer id extends number }
    ? Chain.Chain & { id: id }
    : undefined
  : chainOrId extends number
    ? Chain.Chain & { id: chainOrId }
    : chainOrId

type V2ResolveTargetAccount<
  account extends Account.Account | undefined,
  accountOverride extends V2Account | undefined,
> = [accountOverride] extends [never]
  ? account extends Account.JsonRpc<infer address>
    ? { address: address; type: 'json-rpc' }
    : undefined
  : accountOverride

type V2ResolveTargetChain<chain extends V2Chain | undefined> = [chain] extends [
  never,
]
  ? undefined
  : chain

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
