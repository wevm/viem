import * as RpcResponse from 'ox/RpcResponse'
import type { Client as Client_ } from '../clients/createClient.js'
import type { EIP1193RequestOptions } from '../types/eip1193.js'
import * as Multisig from './internal/relay/multisig.js'
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

  const handle = handleRequest(async (request, requestOptions) => {
    const { chainId, ...rest } = requestOptions ?? {}
    if (chainId === undefined)
      throw new RpcResponse.InvalidParamsError({
        message: 'A chain ID is required to resolve the downstream client.',
      })
    if (clientChainId !== undefined && chainId !== clientChainId)
      throw new RpcResponse.InvalidParamsError({
        message: 'Conflicting chain ids.',
      })
    const client = options.client ?? options.getClient!({ chainId } as never)
    if (client.chain.id !== chainId)
      throw new RpcResponse.InvalidParamsError({
        message: 'Conflicting chain ids.',
      })
    return client.request(request as never, rest)
  }, options)

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
 *     (next) => (request, options) =>
 *       next(request, { ...options, retryCount: 0 }),
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
  return (options.plugins ?? []).reduceRight(
    (next, plugin) => plugin(next),
    next,
  )
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
  }
}

/**
 * Middleware that wraps the next relay request handler.
 *
 * A plugin is applied once when composing a handler, not once per request.
 * Call `next(request, options)` to continue to the remaining plugins and
 * downstream handler, or return a result to handle the request locally.
 *
 * @param next - The remaining request handler pipeline.
 * @returns A handler for this plugin's requests.
 */
export type Plugin = ((
  next: handleRequest.Handler,
) => handleRequest.Handler) & {
  /** Whether this plugin coordinates native multisig approvals. */
  multisig?: true | undefined
}

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
  export type ReturnType = Plugin & { multisig: true }
}

type Client = Pick<Client_, 'request'> & { chain: { id: number } }
