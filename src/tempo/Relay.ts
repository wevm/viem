import type { Address } from 'abitype'
import * as RpcResponse from 'ox/RpcResponse'
import type { Client as Client_ } from '../clients/createClient.js'
import { ChainNotConfiguredError } from '../clients/createClientResolver.js'
import type { EIP1193RequestOptions } from '../types/eip1193.js'
import * as Request_ from './internal/relay/request.js'
import * as internal from './internal/relay.js'
import type * as Sponsorship from './plugins/feePayer.js'
import type * as Store from './Store.js'

// biome-ignore lint/performance/noBarrelFile: Relay exposes its plugin factories.
export { feePayer } from './plugins/feePayer.js'
export { feeToken } from './plugins/feeToken.js'
export { funding } from './plugins/funding.js'
export { multisig } from './plugins/multisig.js'
export { simulate } from './plugins/simulate.js'

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
    /** Deadline in milliseconds for a plugin-handled fill, including callbacks. Defaults to 10,000. */
    timeout?: number | undefined
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
  /** Metadata merged into local transport attributes in plugin order. Later values take precedence. */
  transport?: Readonly<Record<string, unknown>> | undefined
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

type Client = Pick<Client_, 'request'> & { chain: { id: number } }
