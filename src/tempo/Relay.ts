import type { EIP1193RequestOptions } from '../types/eip1193.js'

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
export type Plugin = (next: handleRequest.Handler) => handleRequest.Handler
