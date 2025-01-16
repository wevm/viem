import * as Json from 'ox/Json'
import * as RpcRequest from 'ox/RpcRequest'
import * as RpcResponse from 'ox/RpcResponse'
import type * as RpcSchema from 'ox/RpcSchema'

import * as Errors from '../core/Errors.js'
import { getUrl } from '../core/internal/errors.js'
import * as promise from '../core/internal/promise.js'
import type { Compute, MaybePromise } from '../core/internal/types.js'
import type * as rpc from './internal/rpc.js'

/** Generic asynchronous RPC interface. */
export type RpcAsync<
  options extends Record<string, unknown> = {},
  schema extends RpcSchema.Generic = RpcSchema.Default,
> = Compute<{
  request: RequestFn<options, schema>
}>

/** Asynchronous HTTP RPC interface. */
export type Http<schema extends RpcSchema.Generic = RpcSchema.Default> =
  RpcAsync<fromHttp.Options<schema>, schema>

/** Request function on an RPC interface. */
export type RequestFn<
  options extends Record<string, unknown> = {},
  schema extends RpcSchema.Generic = RpcSchema.Default,
> = <
  schemaOverride extends RpcSchema.Generic | undefined = undefined,
  //
  derivedSchema extends RpcSchema.Generic = schemaOverride extends undefined
    ? schema
    : schemaOverride,
  request extends
    | rpc.Request<derivedSchema>
    | readonly rpc.Request<derivedSchema>[] =
    | rpc.Request<derivedSchema>
    | readonly rpc.Request<derivedSchema>[],
>(
  request:
    | request
    | rpc.Request<derivedSchema>
    | readonly rpc.Request<derivedSchema>[],
  options?: from.Options<options, derivedSchema> | undefined,
) => Promise<
  | (request extends rpc.Request<derivedSchema>
      ? RpcResponse.RpcResponse<
          RpcSchema.ExtractReturnType<derivedSchema, request['method']>
        >
      : never)
  | (request extends readonly rpc.Request<derivedSchema>[]
      ? {
          [index in keyof request]: RpcResponse.RpcResponse<
            RpcSchema.ExtractReturnType<
              derivedSchema,
              request[index] extends rpc.Request<derivedSchema>
                ? request[index]['method']
                : never
            >
          >
        }
      : never)
>

/**
 * Instantiates an asynchronous RPC interface.
 *
 * @example
 * ```ts twoslash
 * import { RpcAsync } from 'viem/utils'
 *
 * const rpc = RpcAsync.from({
 *   async request(body) {
 *     return await fetch('https://1.rpc.thirdweb.com', {
 *       body: JSON.stringify(body),
 *       method: 'POST',
 *     }).then((res) => res.json())
 *   },
 * })
 *
 * const response = await rpc.request({ method: 'eth_blockNumber' })
 * ```
 *
 * @param iface - Interface to instantiate.
 * @param options - Options.
 * @returns Asynchronous RPC interface.
 */
export function from<
  request extends from.Request | readonly from.Request[],
  options extends Record<string, unknown> = Record<string, unknown>,
  schema extends RpcSchema.Generic = RpcSchema.Generic,
>(
  iface: from.Parameters<request, options>,
  options?: from.Options<options, schema>,
): RpcAsync<options, schema> {
  const requestStore = RpcRequest.createStore()
  return {
    async request(request, o: any) {
      const body = Array.isArray(request)
        ? request.map((r) => requestStore.prepare(r as never))
        : requestStore.prepare(request as never)
      const data = await iface.request(body as never, o ?? options)
      return RpcResponse.parse(data, { raw: true }) as never
    },
  }
}

export declare namespace from {
  type Request = Compute<Omit<RpcRequest.RpcRequest, '_returnType'>>

  type Parameters<
    request extends Request | readonly Request[],
    options extends Record<string, unknown> = Record<string, unknown>,
  > = {
    request: (
      request: request | Request | readonly Request[],
      options: options | Record<string, unknown>,
    ) => Promise<
      request extends Request
        ? RpcResponse.RpcResponse
        : RpcResponse.RpcResponse[]
    >
  }

  type Options<
    options extends Record<string, unknown> = {},
    schema extends RpcSchema.Generic = RpcSchema.Generic,
  > = {
    /**
     * RPC Schema to use for the `request` function.
     * @default `RpcSchema.Default`
     */
    schema?: schema | RpcSchema.Generic | undefined
  } & options

  type ErrorType =
    | RpcRequest.createStore.ErrorType
    | RpcResponse.parse.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Instantiates an asynchronous HTTP RPC interface.
 *
 * @example
 * ```ts twoslash
 * import { RpcAsync } from 'viem/utils'
 *
 * const rpc = RpcAsync.fromHttp('https://1.rpc.thirdweb.com')
 *
 * const response = await rpc.request({ method: 'eth_blockNumber' })
 * ```
 *
 * @param url - HTTP URL of an Ethereum JSON-RPC Provider.
 * @param options - Options.
 * @returns Asynchronous HTTP RPC interface.
 */
export function fromHttp<schema extends RpcSchema.Generic = RpcSchema.Default>(
  url: string,
  options: fromHttp.Options<schema> = {},
): Http<schema> {
  return from({
    async request(body, o = {}) {
      try {
        const {
          fetchFn = options.fetchFn ?? fetch,
          fetchOptions: fetchOptions_ = options.fetchOptions,
          onRequest = options.onRequest,
          onResponse = options.onResponse,
          timeout = options.timeout ?? 10_000,
        } = o as fromHttp.Options

        const fetchOptions =
          typeof fetchOptions_ === 'function'
            ? await fetchOptions_(body)
            : fetchOptions_

        const response = await promise.withTimeout(
          async ({ signal }) => {
            const init: RequestInit = {
              ...fetchOptions,
              body: JSON.stringify(body),
              headers: {
                'Content-Type': 'application/json',
                ...fetchOptions?.headers,
              },
              method: fetchOptions?.method ?? 'POST',
              signal: fetchOptions?.signal ?? (timeout > 0 ? signal : null),
            }
            const request = new Request(url, init)
            const args = (await onRequest?.(request, init)) ?? { ...init, url }
            const response = await fetchFn(args.url ?? url, args)
            return response
          },
          {
            timeout,
            signal: true,
          },
        )

        if (onResponse) await onResponse(response)

        const data = await (async () => {
          if (
            response.headers.get('Content-Type')?.startsWith('application/json')
          )
            return response.json()
          return response.text().then((data) => {
            try {
              return JSON.parse(data || '{}')
            } catch (err) {
              if (response.ok)
                throw new MalformedResponseError({
                  response: data,
                })
              return { error: data }
            }
          })
        })()

        if (!response.ok)
          throw new HttpError({
            body,
            details: JSON.stringify(data.error) ?? response.statusText,
            response,
            url,
          })

        return data as never
      } catch (error) {
        if (error instanceof HttpError) throw error
        throw new HttpError({
          body,
          cause: error as Error,
          url,
        })
      }
    },
  })
}

export declare namespace fromHttp {
  type Options<schema extends RpcSchema.Generic = RpcSchema.Default> =
    from.Options<
      {
        /**
         * Request configuration to pass to `fetch`.
         */
        fetchOptions?:
          | Omit<RequestInit, 'body'>
          | ((
              request: from.Request | readonly from.Request[],
            ) => Omit<RequestInit, 'body'> | Promise<Omit<RequestInit, 'body'>>)
          | undefined
        /**
         * Function to use to make the request.
         * @default fetch
         */
        fetchFn?: typeof fetch | undefined
        /**
         * A callback to handle the request.
         */
        onRequest?:
          | ((
              request: Request,
              init: RequestInit,
            ) => MaybePromise<
              (RequestInit & { url?: string | undefined }) | undefined | void
            >)
          | undefined
        /**
         * A callback to handle the response.
         */
        onResponse?: ((response: Response) => Promise<void> | void) | undefined
        /**
         * Timeout for the request in milliseconds.
         * @default 10_000
         */
        timeout?: number | undefined
      },
      schema
    >
}

/** Thrown when a HTTP request fails. */
export class HttpError extends Errors.BaseError<Error> {
  override readonly name = 'RpcAsync.HttpError'

  constructor({
    body,
    cause,
    details,
    response,
    url,
  }: {
    body?: unknown
    cause?: Error | undefined
    details?: string | undefined
    response?: Response | undefined
    url: string
  }) {
    super('HTTP request failed.', {
      cause,
      details,
      metaMessages: [
        response ? `Status: ${response.status}` : undefined,
        `URL: ${getUrl(url)}`,
        `Body: ${Json.stringify(body)}`,
      ],
    })
  }
}

/** Thrown when a HTTP response is malformed. */
export class MalformedResponseError extends Errors.BaseError {
  override readonly name = 'RpcAsync.MalformedResponseError'

  constructor({ response }: { response: string }) {
    super('HTTP Response could not be parsed as JSON.', {
      metaMessages: [`Response: ${response}`],
    })
  }
}
