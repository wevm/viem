import type { RpcSchema } from 'ox'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import * as Provider from 'ox/Provider'
import type * as RpcRequest from 'ox/RpcRequest'
import * as RpcResponse from 'ox/RpcResponse'

import * as RpcAsync from '../utils/RpcAsync.js'
import type * as rpc from '../utils/internal/rpc.js'
import type * as Client from './Client.js'
import * as Errors from './Errors.js'
import { getUrl } from './internal/errors.js'
import * as promise from './internal/promise.js'
import type { Compute, ExactPartial } from './internal/types.js'
import * as Uid from './internal/uid.js'

type Config = ExactPartial<Pick<Client.Client, 'chain' | 'pollingInterval'>>

/** A transport instance. */
export type Transport<
  type extends string = string,
  properties extends Record<string, unknown> = {},
  rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
> = {
  setup: (
    config?: (Config & from.Options) | undefined,
  ) => TransportValue<type, properties, rpcSchema>
}

/** Transport value. */
export type TransportValue<
  type extends string = string,
  properties extends Record<string, unknown> = {},
  rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
> = Compute<
  {
    /** EIP-1193-compatible `request` function. */
    request: RequestFn<rpcSchema>
    /** The base delay (in ms) between retries. */
    retryDelay?: number | undefined
    /** The max number of times to retry. */
    retryCount?: number | undefined
    /** The timeout (in ms) for requests. */
    timeout?: number | undefined
    /** The type of transport. */
    type: type
  } & properties
>

/** HTTP Transport instance. */
export type Http<rpcSchema extends RpcSchema.Generic = RpcSchema.Default> =
  Transport<'http', { url: string }, rpcSchema>

/** HTTP Transport value. */
export type HttpValue<rpcSchema extends RpcSchema.Generic = RpcSchema.Default> =
  ReturnType<Http<rpcSchema>['setup']>

/** Request function on the Transport interface. */
export type RequestFn<schema extends RpcSchema.Generic = RpcSchema.Generic> = <
  methodName extends RpcSchema.MethodNameGeneric,
>(
  request: rpc.Request<schema, methodName>,
  options?:
    | {
        /** Deduplicate in-flight requests. */
        dedupe?: boolean | undefined
        /** The base delay (in ms) between retries. */
        retryDelay?: number | undefined
        /** The max number of times to retry. */
        retryCount?: number | undefined
        /** Unique identifier for the request. */
        uid?: string | undefined
      }
    | undefined,
) => Promise<RpcSchema.ExtractReturnType<schema, methodName>>

// TODO
// export function provider() {}

/**
 * Instantiates a new Transport.
 *
 * @example
 * ```ts
 * import { Transport } from 'ox'
 * import { RpcAsync, RpcResponse } from 'ox/utils'
 *
 * const transport = Transport.from({
 *   setup(config) {
 *     const url = config.url ?? 'https://example.com'
 *
 *     const rpc = RpcAsync.fromHttp(url)
 *
 *     return {
 *       request(request) {
 *         const response = await rpc.request(request)
 *         return RpcResponse.parse(response)
 *       },
 *       type: 'http',
 *       url,
 *     }
 *   },
 * })
 *
 *
 * ```
 *
 * @returns A new Transport instance.
 */
export function from<
  type extends string,
  properties extends Record<string, unknown>,
  rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
>(
  transport: Transport<type, properties, rpcSchema>,
  options: from.Options<rpcSchema> = {},
): Transport<type, properties, rpcSchema> {
  return {
    setup(config = {}) {
      const uid = Uid.uid()
      const retryCount = config.retryCount ?? options.retryCount ?? 3
      const retryDelay = config.retryDelay ?? options.retryDelay ?? 150
      const timeout = config.timeout ?? options.timeout ?? 10_000
      const url = config.url ?? options.url

      const value = transport.setup({
        ...config,
        retryCount,
        retryDelay,
        timeout,
        url,
      })

      return {
        ...value,
        request(request, options) {
          const dedupe = options?.dedupe ?? false
          const retryCount_ = options?.retryCount ?? retryCount
          const retryDelay_ = options?.retryDelay ?? retryDelay

          const id = dedupe
            ? Hash.keccak256(
                Hex.fromString(`${uid}.${Json.stringify(request)}`),
              )
            : undefined

          return promise.withDedupe(
            () =>
              promise.withRetry(
                async () => {
                  try {
                    return await value.request(request)
                  } catch (e) {
                    const error = (() => {
                      if (e instanceof RpcResponse.BaseError) {
                        const data =
                          (e.data as {
                            code?: number
                            message?: string
                          }) || {}
                        if (data.code === 5000)
                          return new Provider.UserRejectedRequestError({
                            message: data.message,
                          })
                        return Provider.parseError(e)
                      }
                      return e
                    })()
                    throw new RequestError(error as http.ErrorType, {
                      request,
                      url,
                    })
                  }
                },
                {
                  delay: ({ count, error }) => {
                    // If we find a Retry-After header, let's retry after the given time.
                    if (
                      error.cause &&
                      error.cause instanceof RpcAsync.HttpError
                    ) {
                      const retryAfter =
                        error.cause.response?.headers?.get('Retry-After')
                      if (retryAfter?.match(/\d/))
                        return Number.parseInt(retryAfter) * 1000
                    }

                    // Otherwise, let's retry with an exponential backoff.
                    return ~~(1 << count) * retryDelay_
                  },
                  retryCount: retryCount_,
                  shouldRetry: ({ error }) => shouldRetry(error.cause as Error),
                },
              ),
            { enabled: dedupe, id },
          )
        },
      }
    },
  }
}

export declare namespace from {
  type Options<rpcSchema extends RpcSchema.Generic = RpcSchema.Default> = {
    /** The base delay (in ms) between retries. */
    retryDelay?: number | undefined
    /** The max number of times to retry. */
    retryCount?: number | undefined
    /** The RPC schema to use for the request. */
    schema?: rpcSchema | RpcSchema.Generic | undefined
    /** The timeout (in ms) for requests. */
    timeout?: number | undefined
    /** Request URL. */
    url?: string | undefined
  }

  type ErrorType =
    | Hash.keccak256.ErrorType
    | promise.withDedupe.ErrorType
    | promise.withRetry.ErrorType
    | promise.withTimeout.ErrorType
    | RequestError
    | Errors.GlobalErrorType
}

/**
 * Instantiates a new HTTP Transport.
 *
 * @example
 * ```ts twoslash
 * import { Transport } from 'ox'
 *
 * const transport = Transport.http('https://1.rpc.thirdweb.com')
 * ```
 *
 * @returns A HTTP Transport instance.
 */
export function http<rpcSchema extends RpcSchema.Generic = RpcSchema.Default>(
  url: string | undefined = undefined,
  options: http.Options<rpcSchema> = {},
): Http<rpcSchema> {
  const {
    batch,
    fetchOptions,
    onFetchRequest,
    onFetchResponse,
    retryCount,
    retryDelay,
    schema,
    timeout,
  } = options

  const { batchSize = 1000, wait = 0 } = typeof batch === 'object' ? batch : {}

  return from(
    {
      setup(config = {}) {
        const { retryCount, retryDelay, timeout } = config
        const url_ = config.url! /** ?? chain?.rpcUrls.default.http[0] */

        const rpc = RpcAsync.fromHttp(url_, {
          fetchOptions,
          onRequest: onFetchRequest,
          onResponse: onFetchResponse,
          timeout,
        })

        return {
          async request(r) {
            const request = r as unknown as RpcRequest.RpcRequest

            const { schedule } = promise.createBatchScheduler({
              id: url_,
              fn: (requests: readonly RpcRequest.RpcRequest[]) =>
                rpc.request(requests),
              shouldSplitBatch(requests) {
                return requests.length > batchSize
              },
              sort: (a, b) => a.id - b.id,
              wait,
            })

            const fn = async (body: RpcRequest.RpcRequest) =>
              batch ? schedule(body) : [await rpc.request(body)]

            const [response] = await fn(request)
            return RpcResponse.parse(response) as never
          },
          retryCount,
          retryDelay,
          timeout,
          type: 'http',
          url: url_,
        }
      },
    },
    {
      retryCount,
      retryDelay,
      schema,
      timeout,
      url,
    },
  )
}

export declare namespace http {
  type Options<rpcSchema extends RpcSchema.Generic = RpcSchema.Default> =
    from.Options<rpcSchema> & {
      /** Whether to enable Batch JSON-RPC. */
      batch?:
        | boolean
        | {
            /** The maximum number of JSON-RPC requests to send in a batch. @default 1_000 */
            batchSize?: number | undefined
            /** The maximum number of milliseconds to wait before sending a batch. @default 0 */
            wait?: number | undefined
          }
        | undefined
      /**
       * Function to use to make the request.
       * @default fetch
       */
      fetchFn?: RpcAsync.fromHttp.Options['fetchFn'] | undefined
      /**
       * Request configuration to pass to `fetch`.
       */
      fetchOptions?: RpcAsync.fromHttp.Options['fetchOptions'] | undefined
      /**
       * A callback to handle the request from `fetch`.
       */
      onFetchRequest?: RpcAsync.fromHttp.Options['onRequest'] | undefined
      /**
       * A callback to handle the response from `fetch`.
       */
      onFetchResponse?: RpcAsync.fromHttp.Options['onResponse'] | undefined
    }

  type ErrorType =
    | promise.createBatchScheduler.ErrorType
    | RpcAsync.fromHttp.ErrorType
    | RpcResponse.parse.ErrorType
    | Errors.GlobalErrorType
}

// TODO
// export function ipc() {}

// TODO
// export function webSocket() {}

/** Thrown when a HTTP request fails. */
export class RequestError extends Errors.BaseError<http.ErrorType> {
  override readonly name = 'Transport.RequestError'

  request: unknown
  url?: string

  constructor(
    cause: http.ErrorType,
    {
      request,
      url,
    }: {
      request: unknown
      url?: string | undefined
    },
  ) {
    super('shortMessage' in cause ? cause.shortMessage : cause.message, {
      cause,
      metaMessages: [
        url ? `URL: ${getUrl(url)}` : undefined,
        `Request: ${Json.stringify(request)}`,
      ],
    })

    this.request = request
    if (url) this.url = url
  }
}

////////////////////////////////////////////////////////////////////////
// Internal
////////////////////////////////////////////////////////////////////////

/** @internal */
export function shouldRetry(error: Error) {
  if ('code' in error && typeof error.code === 'number') {
    if (error.code === RpcResponse.LimitExceededError.code) return true
    if (error.code === RpcResponse.InternalError.code) return true
    return false
  }
  if (error instanceof RpcAsync.HttpError && error.response?.status) {
    const status = error.response.status
    // Forbidden
    if (status === 403) return true
    // Request Timeout
    if (status === 408) return true
    // Request Entity Too Large
    if (status === 413) return true
    // Too Many Requests
    if (status === 429) return true
    // Internal Server Error
    if (status === 500) return true
    // Bad Gateway
    if (status === 502) return true
    // Service Unavailable
    if (status === 503) return true
    // Gateway Timeout
    if (status === 504) return true
    return false
  }
  return true
}
