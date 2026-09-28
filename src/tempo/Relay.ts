import type { Address } from 'abitype'
import * as RpcResponse from 'ox/RpcResponse'
import type { LocalAccount } from '../accounts/types.js'
import type { Client as Client_ } from '../clients/createClient.js'
import { ChainNotConfiguredError } from '../clients/createClientResolver.js'
import type { EIP1193RequestOptions } from '../types/eip1193.js'
import type * as Funding_ from './Funding.js'
import * as Sponsorship from './internal/relay/feePayer.js'
import * as FeeToken from './internal/relay/feeToken.js'
import * as Funding from './internal/relay/funding.js'
import * as Multisig from './internal/relay/multisig.js'
import * as Request_ from './internal/relay/request.js'
import * as Simulate from './internal/relay/simulate.js'
import * as internal from './internal/relay.js'
import type * as Store from './Store.js'

/**
 * Creates a relay with RPC and Fetch handlers backed by a client or chain resolver.
 *
 * Pass a chain-configured `client` for a single chain, or `getClient` for multiple
 * chains. Plugins may resolve the chain before forwarding to the selected client.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Relay } from 'viem/tempo'
 *
 * const relay = Relay.create({
 *   client: createClient({ chain: tempo, transport: http() }),
 * })
 * export default { fetch: relay.fetch }
 * ```
 *
 * @param options - Client selection and relay plugins.
 * @returns RPC and Fetch handlers sharing the same plugins.
 */
export function create<const chainId extends number>(
  options: handleRequest.Options & {
    client: Client & { chain: { id: chainId } }
    getClient?: never
  },
): create.ReturnType<chainId>
export function create<const chainId extends number = number>(
  options: handleRequest.Options & {
    client?: never
    getClient: (options: { chainId: chainId }) => Client
  },
): create.ReturnType<chainId>
export function create<getClient extends (options: never) => Client>(
  options: handleRequest.Options & { client?: never; getClient: getClient },
): create.ReturnType<
  Parameters<getClient>[0] extends { chainId: infer chainId extends number }
    ? chainId
    : number
>
export function create(
  options: handleRequest.Options & {
    client?: Client | undefined
    getClient?: ((options: never) => Client) | undefined
  },
): create.ReturnType {
  if (Boolean(options.client) === Boolean(options.getClient))
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected exactly one of client or getClient.',
    })
  const clientChainId = options.client?.chain?.id
  if (
    options.client &&
    (!Number.isSafeInteger(clientChainId) ||
      !clientChainId ||
      clientChainId <= 0)
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected a client with a configured chain.',
    })

  const getClient = (chainId: number) => {
    try {
      const client = options.client ?? options.getClient!({ chainId } as never)
      if (client.chain.id !== chainId)
        throw new RpcResponse.InvalidParamsError({
          message: 'Conflicting chain ids.',
        })
      return client
    } catch (error) {
      if (error instanceof ChainNotConfiguredError)
        throw new RpcResponse.InvalidParamsError({
          message: error.shortMessage,
        })
      throw error
    }
  }
  const handle = Request_.compose(
    async (request, requestOptions) => {
      const { chainId, response: _, ...rest } = requestOptions ?? {}
      if (chainId === undefined)
        throw new RpcResponse.InvalidParamsError({
          message: 'A chain ID is required to resolve the downstream client.',
        })
      return getClient(chainId).request(request as never, rest)
    },
    options,
    getClient,
  )

  const request: handleRequest.Handler = (request, requestOptions) => {
    const chainId = requestOptions?.chainId ?? clientChainId
    if (
      chainId !== undefined &&
      (!Number.isSafeInteger(chainId) || chainId <= 0)
    )
      return Promise.reject(
        new RpcResponse.InvalidParamsError({
          message: 'Expected a valid chain ID.',
        }),
      )
    if (clientChainId !== undefined && chainId !== clientChainId)
      return Promise.reject(
        new RpcResponse.InvalidParamsError({
          message: 'Conflicting chain ids.',
        }),
      )
    return handle(request, { ...requestOptions, chainId })
  }
  return {
    request,
    fetch: (request_, options: create.RequestOptions = {}) =>
      internal.fetch(request_, request, options),
  }
}

export declare namespace create {
  /** Client selection and middleware for a relay. */
  export type Options<chainId extends number = number> = handleRequest.Options &
    (
      | {
          /** Chain-configured client used for every forwarded request. */
          client: Client & { chain: { id: chainId } }
          getClient?: never
        }
      | {
          client?: never
          /** Resolves the client after plugins have selected the request's chain. */
          getClient: (options: {
            chainId: chainId
          }) => Client & { chain: { id: number } }
        }
    )

  /** Optional chain selection and RPC request options. */
  export type RequestOptions<chainId extends number = number> = Omit<
    handleRequest.RequestOptions,
    'chainId'
  > & { chainId?: chainId | undefined }

  /** Handlers sharing one composed relay pipeline. */
  export type ReturnType<chainId extends number = number> = {
    /** Handles a POST JSON-RPC request, returning JSON or an empty 204 for notifications. */
    fetch: {
      (request: Request): Promise<Response>
      (
        request: Request,
        options?: RequestOptions<chainId> | undefined,
      ): Promise<Response>
    }
    /** Handles a parsed RPC call and returns its result. */
    request: (
      request: handleRequest.Request,
      options?: RequestOptions<chainId> | undefined,
    ) => Promise<unknown>
  }
}

/**
 * Creates an RPC request handler by composing relay plugins around a downstream handler.
 *
 * Requests enter plugins in array order, and responses return in reverse order.
 * Post-fill hooks run concurrently after middleware finishes. Middleware sees
 * the downstream result before post-fill enrichment and signing.
 * Without plugins, the downstream handler is returned unchanged. Plugins decide
 * whether to forward, transform, or handle a request. Errors propagate unchanged
 * unless a plugin handles them.
 *
 * @example
 * ```ts
 * import { http } from 'viem'
 * import { Relay } from 'viem/tempo'
 *
 * const rpc = http('https://rpc.tempo.xyz')({})
 * const handle = Relay.handleRequest(rpc.request, {
 *   plugins: [
 *     {
 *       async handleRequest(context, next) {
 *         context.options.retryCount = 0
 *         await next()
 *       },
 *     },
 *   ],
 * })
 * const chainId = await handle({ method: 'eth_chainId' })
 * // @log: '0x1079'
 * ```
 *
 * @param next - Downstream RPC request handler, typically forwarding to the Tempo (Execution) RPC.
 * @param options - Relay options.
 * @returns The composed RPC request handler.
 */
export function handleRequest(
  next: handleRequest.Handler,
  options: handleRequest.Options = {},
): handleRequest.Handler {
  return Request_.compose(next, options)
}

export declare namespace handleRequest {
  /** RPC request handler shared by relay plugins and the downstream execution RPC. */
  export type Handler = (
    request: Request,
    options?: RequestOptions | undefined,
  ) => Promise<unknown>

  /** Options for {@link handleRequest}. */
  export type Options = {
    /** Plugins in request execution order. Defaults to an empty list. */
    plugins?: readonly Plugin[] | undefined
    /** Fee-token candidates shared by all plugins, memoized per request and chain. */
    resolveTokens?:
      | ((chainId: number) => readonly Address[] | Promise<readonly Address[]>)
      | undefined
  }

  /** RPC request passed to a handler. */
  export type Request = {
    /** RPC method name. */
    method: string
    /** RPC method parameters. */
    params?: readonly unknown[] | undefined
  }

  /** Options for one handled request. */
  export type RequestOptions = EIP1193RequestOptions & {
    /** Chain selected by the caller or resolved by a plugin. */
    chainId?: number | undefined
    /** Response metadata collected by the Fetch adapter. */
    response?:
      | { sponsorship_details?: Sponsorship.SponsorshipDetails | undefined }
      | undefined
  }
}

/** Hooks extending relay request processing and filled transaction responses. */
export type Plugin = {
  /** Processes an RPC request. Await next(), then read or replace context.result. */
  handleRequest?:
    | ((context: Plugin.Context, next: () => Promise<void>) => Promise<unknown>)
    | undefined
  /** Runs concurrently after the final fill. Returns capability fields to merge. */
  afterFill?:
    | ((
        filled: Plugin.FillResult,
        context: Plugin.Context,
      ) => Promise<Plugin.Enrichment | undefined>)
    | undefined
  /** Signs the final fill concurrently with enrichment. Only one signer may be registered. */
  signTransaction?:
    | ((
        filled: Plugin.FillResult,
        context: Plugin.Context,
      ) => Promise<Plugin.Signature | undefined>)
    | undefined
}

export declare namespace Plugin {
  /** State and services isolated to one RPC invocation. */
  export type Context = {
    /** Current RPC request. Changes are passed to next(). */
    request: handleRequest.Request
    /** Downstream result, populated by next(). */
    result: unknown
    /** Transport options and selected chain. */
    options: handleRequest.RequestOptions
    /** Downstream client for the selected chain. */
    readonly client: Client_
    /** Gets a downstream client for the selected or specified chain. */
    getClient: (chainId?: number) => Client_
    /** Gets the shared token candidates for the selected or specified chain. */
    resolveTokens: (chainId?: number) => Promise<readonly Address[]>
    /** Scopes a configured store to this invocation. */
    getStore: (store: Store.Store | undefined) => Store.Store | undefined
  }
  /** Immutable RPC fill supplied to post-fill hooks. */
  export type FillResult = {
    readonly tx: Readonly<Record<string, unknown>>
    readonly capabilities?: Readonly<Record<string, unknown>> | undefined
    readonly sponsor?: unknown
  }
  /** Additional response capabilities. Duplicate keys from hooks are rejected. */
  export type Enrichment = {
    capabilities?: Record<string, unknown> | undefined
  }
  /** Fee-payer signature in RPC format. */
  export type Signature = {
    r: `0x${string}`
    s: `0x${string}`
    yParity: `0x${string}`
  }
}

declare const multisigBrand: unique symbol

/**
 * Coordinates native multisig approvals using shared atomic storage.
 *
 * Memory storage is process-local. Independent clients and multiple server
 * instances must use the same persistent store to share pending approvals.
 *
 * @example
 * ```ts
 * import { http } from 'viem'
 * import { Relay, Store, withRelay } from 'viem/tempo'
 *
 * const transport = withRelay(http(), {
 *   plugins: [Relay.multisig({ store: Store.memory() })],
 * })
 * ```
 *
 * @param options - Shared atomic storage.
 * @returns A plugin that coordinates multisig requests and forwards other calls.
 */
export function multisig(options: multisig.Options): multisig.ReturnType {
  return Multisig.create(options)
}

export declare namespace multisig {
  /** Multisig coordination options. */
  export type Options = {
    /** Store shared by multisig coordinators, with atomic compare-and-set support. */
    store: Store.Atomic
  }
  /** Middleware advertising native multisig coordination. */
  export type ReturnType = Plugin & { readonly [multisigBrand]: true }
}

/**
 * Sponsors transactions with a local account or an external fee-payer relay.
 *
 * Place multisig before this plugin and fee-token selection after it.
 *
 * @example
 * ```ts
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Relay } from 'viem/tempo'
 * const plugin = Relay.feePayer({ account: privateKeyToAccount('0x...') })
 * ```
 * @param options - Sponsor account, policy, and display metadata.
 * @returns A fee-payer relay plugin.
 */
export function feePayer(options: feePayer.Options = {}): Plugin {
  return Sponsorship.create(options)
}

export declare namespace feePayer {
  /** Fee sponsorship configuration. */
  export type Options = {
    /** Local sponsor. Omit when requests use an external fee-payer URL. */
    account?: LocalAccount | undefined
    /** Trusted external fee-payer URLs. Matches the normalized full URL, including path and query. Defaults to none. */
    allowedFeePayers?: readonly string[] | undefined
    /** Sponsor's preferred fee token. Overrides the request token on sponsored fills. */
    feeToken?: Address | undefined
    /** Allow HTTP and private external relay hosts in trusted development environments. @default false */
    internal_allowUnsafeUrls?: boolean | undefined
    /** Display name returned in sponsor capabilities. */
    name?: string | undefined
    /** Called after signing and before returning or broadcasting. A thrown error aborts sponsorship. */
    onSponsored?: Sponsorship.sign.Options['onSponsored'] | undefined
    /** Sponsor display URL. */
    url?: string | undefined
    /** Only `true` authorizes sponsorship. Rejected fills fall back to sender-paid transactions. */
    validate?: Sponsorship.Validate | undefined
  }
  /** Result of a sponsorship policy check. */
  export type Validation = Sponsorship.Validation
  /** Facts passed to the sponsorship callback. */
  export type SponsoredEvent = Sponsorship.SponsoredEvent
}

/**
 * Resolves fee tokens from user preferences and token balances.
 *
 * @example
 * ```ts
 * import { Relay } from 'viem/tempo'
 * const plugin = Relay.feeToken()
 * ```
 * @param options - Optional preference store.
 * @returns A fee-token relay plugin.
 */
export function feeToken(options: feeToken.Options = {}): Plugin {
  return FeeToken.create(options)
}

export declare namespace feeToken {
  /** Fee-token selection configuration. */
  export type Options = {
    /** Store for cached user fee-token preferences. */
    store?: Store.Store | undefined
  }
}

declare const fundingBrand: unique symbol

/**
 * Infers token requirements and resolves funding sources before filling, calling, or estimating a transaction.
 *
 * No other plugins are required. Add feePayer for sponsorship, feeToken for fee-token
 * selection, and simulate for a funded execution preview. Place funding before
 * feePayer so prepared transactions resolve funding before sponsorship.
 *
 * @example
 * ```ts
 * import { http } from 'viem'
 * import { Relay, withRelay } from 'viem/tempo'
 *
 * const transport = withRelay(http(), {
 *   plugins: [Relay.funding()],
 * })
 * ```
 * @param options - Discovery routes and policy rules storage.
 * @returns A funding relay plugin.
 * @experimental
 */
export function funding(options: funding.Options = {}): funding.ReturnType {
  return Funding.create(options)
}

export declare namespace funding {
  /** Funding discovery and policy rules storage. */
  export type Options = Funding_.handleRequest.Parameters
  /** Middleware advertising funding resolution. */
  export type ReturnType = Plugin & { readonly [fundingBrand]: true }
}

/**
 * Adds balance changes, estimated fees, and execution errors to fill capabilities.
 *
 * Runs after transaction middleware to simulate the final filled result.
 *
 * @example
 * ```ts
 * import { Relay } from 'viem/tempo'
 * const plugin = Relay.simulate()
 * ```
 * @param options - Optional metadata store.
 * @returns A simulation relay plugin.
 */
export function simulate(options: simulate.Options = {}): Plugin {
  return Simulate.create(options)
}

export declare namespace simulate {
  /** Simulation configuration. */
  export type Options = {
    /** Store for cached metadata. Omit to read metadata for each request. */
    store?: Store.Store | undefined
  }
}

type Client = Pick<Client_, 'request'> & { chain: { id: number } }
