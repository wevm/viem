import * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from './Account.js'
import { BaseError } from './BaseError.js'
import type * as Chain from './Chain.js'
import {
  type RequestFn as InternalRequestFn,
  buildRequest,
} from './internal/buildRequest.js'

/** Transport factory used by viem clients. */
export type Transport<
  type extends string = string,
  value = unknown,
  request extends AnyRequestFn = AnyRequestFn,
> = (options: Options) => Instance<type, value, request>

/** Concrete transport instance used by viem clients. */
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

/** Transport construction options. */
export type Options<chain extends Chain.Chain | undefined = Chain.Chain> = {
  account?: Account.Account | undefined
  chain?: chain | undefined
  pollingInterval?: number | undefined
  retryCount?: number | undefined
  timeout?: number | undefined
}

/** Concrete transport configuration. */
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
  exclude?: readonly string[] | undefined
  include?: readonly string[] | undefined
}

/** JSON-RPC request shape accepted by transports. */
export type Request<
  schema extends RpcSchema.Generic = RpcSchema.Generic,
  methodName extends RpcSchema.MethodNameGeneric<schema> =
    RpcSchema.MethodNameGeneric<schema>,
> = Extract<schema['Request'], { method: methodName }>

/** JSON-RPC request options. */
export type RequestOptions = buildRequest.OverrideOptions

/** JSON-RPC request function. */
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

export type AnyRequestFn = (
  request: Request,
  options?: RequestOptions | undefined,
) => Promise<unknown>

/** Creates a concrete transport instance. */
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

/** Returns whether fallback transports should stop on an error. */
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
