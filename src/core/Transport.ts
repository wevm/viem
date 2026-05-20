import * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from './Account.js'
import { BaseError } from './BaseError.js'
import type * as Chain from './Chain.js'
import {
  type RequestFn as InternalRequestFn,
  buildRequest,
} from './internal/buildRequest.js'

/** Root type for a viem Transport. */
export type Transport<
  type extends string = string,
  value = unknown,
  request extends AnyRequestFn = AnyRequestFn,
> = (options: Options) => Instance<type, value, request>

/** Concrete Transport instance used by viem Clients. */
export type Instance<
  type extends string = string,
  value = unknown,
  request extends AnyRequestFn = AnyRequestFn,
> = {
  /** Transport configuration. */
  config: Config<type, request>
  /** JSON-RPC request function. */
  request: request
  /** Transport-specific metadata. */
  value?: value | undefined
}

/** Options for creating a Transport instance for a Client. */
export type Options<chain extends Chain.Chain | undefined = Chain.Chain> = {
  /** Account to use for the Client. */
  account?: Account.Account | undefined
  /** Chain to use for the Client. */
  chain?: chain | undefined
  /** Polling interval in milliseconds. */
  pollingInterval?: number | undefined
  /** Retry count. */
  retryCount?: number | undefined
  /** Request timeout in milliseconds. */
  timeout?: number | undefined
}

/** Configuration for a concrete Transport instance. */
export type Config<
  type extends string = string,
  request extends AnyRequestFn = AnyRequestFn,
> = {
  /** Transport key. */
  key: string
  /** Methods to include or exclude from this transport. */
  methods?: Methods | undefined
  /** Transport display name. */
  name: string
  /** Raw request implementation. */
  request: request
  /** Retry count. */
  retryCount?: number | undefined
  /** Retry delay in milliseconds. */
  retryDelay?: number | undefined
  /** Request timeout in milliseconds. */
  timeout?: number | undefined
  /** Transport type. */
  type: type
}

/** JSON-RPC method filter. */
export type Methods = {
  /** Methods to exclude from this Transport. */
  exclude?: readonly string[] | undefined
  /** Methods to include on this Transport. */
  include?: readonly string[] | undefined
}

/** JSON-RPC request shape accepted by Transports. */
export type Request<
  schema extends RpcSchema.Generic = RpcSchema.Generic,
  methodName extends RpcSchema.MethodNameGeneric<schema> =
    RpcSchema.MethodNameGeneric<schema>,
> = Extract<schema['Request'], { method: methodName }>

/** JSON-RPC request options. */
export type RequestOptions = buildRequest.OverrideOptions

/** JSON-RPC request function used by Transports. */
export type RequestFn<
  schema extends RpcSchema.Generic = RpcSchema.Generic,
  raw extends boolean = false,
> = <methodName extends RpcSchema.MethodNameGeneric<schema>>(
  request: Request<schema, methodName>,
  options?: RequestOptions | undefined,
) => Promise<
  raw extends true
    ? {
        error?: unknown | undefined
        result?: RpcSchema.ExtractReturnType<schema, methodName> | undefined
      }
    : RpcSchema.ExtractReturnType<schema, methodName>
>

/** JSON-RPC request function with an unknown return type. */
export type AnyRequestFn = (
  request: Request,
  options?: RequestOptions | undefined,
) => Promise<unknown>

/**
 * Creates a concrete Transport instance.
 *
 * @example
 * ```ts twoslash
 * import { Transport } from 'viem'
 *
 * const transport = Transport.create({
 *   key: 'mock',
 *   name: 'Mock',
 *   request: async ({ method }) => method,
 *   type: 'mock'
 * })
 *
 * await transport.request({ method: 'eth_blockNumber' })
 * // @log: 'eth_blockNumber'
 * ```
 *
 * @param config - Transport configuration.
 * @param value - Transport-specific metadata.
 * @returns Concrete Transport instance.
 */
export function create<
  const type extends string,
  value,
  request extends AnyRequestFn,
>(
  config: Config<type, request>,
  value?: value | undefined,
): Instance<type, value, request> {
  const {
    key,
    methods,
    name,
    request,
    retryCount = 3,
    retryDelay = 150,
    timeout,
    type,
  } = config
  const uid = Hex.random(32)

  return {
    config: {
      key,
      methods,
      name,
      request,
      retryCount,
      retryDelay,
      timeout,
      type,
    },
    request: buildRequest(request as InternalRequestFn, {
      methods,
      retryCount,
      retryDelay,
      uid,
    }) as unknown as request,
    value,
  }
}

export declare namespace create {
  type ErrorType = never
}

/**
 * Returns whether a Fallback Transport should stop after an error.
 *
 * @example
 * ```ts twoslash
 * import { Transport } from 'viem'
 *
 * Transport.shouldThrow(
 *   Object.assign(new Error('rejected'), { code: 4001 })
 * )
 * // @log: true
 *
 * Transport.shouldThrow(
 *   Object.assign(new Error('internal'), { code: -32603 })
 * )
 * // @log: false
 * ```
 *
 * @param error - Error to evaluate.
 * @returns Whether a Fallback Transport should stop.
 */
export function shouldThrow(error: Error) {
  if ('code' in error && typeof error.code === 'number') {
    if (error.code === -32003) return true
    if (error.code === 4001) return true
    if (error.code === 5000) return true
    if (error.code === 7000) return true
  }
  return /execution reverted|gas required exceeds allowance/.test(error.message)
}

export declare namespace shouldThrow {
  type ErrorType = never
}

/** Thrown when a transport cannot resolve a URL. */
export class UrlRequiredError extends BaseError {
  override readonly name = 'Transport.UrlRequiredError'

  constructor() {
    super(
      'No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.',
      {
        docsPath: '/docs/clients/intro',
      },
    )
  }
}
