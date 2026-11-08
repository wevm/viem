import { RpcResponse } from 'ox'
import type { RpcSchema } from 'ox'

import * as RpcClient from '../../utils/RpcClient.js'
import * as errors from './errors.js'
import * as promise from './promise.js'
import { stringify } from './stringify.js'
import type { Compute, IsNarrowable, OneOf } from './types.js'

/** Request params: typed when `methodName` is in `schema`, generic otherwise. */
type ExtractRequest<
  schema extends RpcSchema.Generic,
  methodName extends RpcSchema.MethodNameGeneric<schema>,
> = Compute<
  Omit<
    {
      method: methodName | schema['Request']['method']
      params?: unknown
    } & (methodName extends schema['Request']['method']
      ? IsNarrowable<schema, RpcSchema.Generic> extends true
        ? Extract<schema, { Request: { method: methodName } }>['Request']
        : {}
      : {}),
    ''
  >
>

/**
 * An EIP-1193-style request function, typed against an `RpcSchema` so
 * the result is inferred from the method. When `raw` is `true`, resolves the
 * JSON-RPC response envelope (`result`/`error`) instead of the bare result.
 */
export type RequestFn<
  schema extends RpcSchema.Generic = RpcSchema.Default,
  raw extends boolean = false,
> = <
  methodName extends RpcSchema.MethodNameGeneric<schema>,
  // Defaulted so every `RequestFn` instantiation stays mutually assignable.
  _returnType = raw extends true
    ? OneOf<
        | { result: RpcSchema.ExtractReturnType<schema, methodName> }
        | { error: RpcResponse.ErrorObject }
      >
    : RpcSchema.ExtractReturnType<schema, methodName>,
>(
  parameters: ExtractRequest<schema, methodName>,
  options?: wrapRequest.Options | undefined,
) => Promise<_returnType>

/**
 * Wraps an rpc request function with method filtering, retry/backoff, and
 * in-flight dedupe. Error mapping is owned upstream by the ox transport
 * (`RpcResponse`/`Provider`); this layer only filters, retries, and dedupes.
 */
export function wrapRequest<
  request extends (
    args: any,
    options?: { signal?: AbortSignal | undefined } | undefined,
  ) => Promise<any>,
>(request: request, options: wrapRequest.Options = {}): RequestFn {
  const requestFn = async (
    args: { method: string; params?: unknown },
    overrideOptions: wrapRequest.Options = {},
  ) => {
    const {
      dedupe = false,
      methods,
      retryDelay = 150,
      retryCount = 3,
      signal,
      uid,
    } = { ...options, ...overrideOptions }

    const { method } = args
    const exclude = (methods as { exclude?: string[] } | undefined)?.exclude
    const include = (methods as { include?: string[] } | undefined)?.include
    if (exclude?.includes(method) || (include && !include.includes(method)))
      throw new RpcResponse.MethodNotSupportedError({
        message: `Method "${method}" is not supported.`,
      })

    if (signal?.aborted) throw errors.getAbortError(signal)

    const requestId = dedupe
      ? hashString(`${uid}.${stringify(args)}`)
      : undefined

    try {
      return await promise.withDedupe(
        () =>
          promise.withRetry(
            () => request(args, signal ? { signal } : undefined),
            {
              delay: ({ count, error }) => {
                // Honor a `Retry-After` header when the error carries one.
                const headers = (
                  (error && httpErrors.get(error)) ??
                  (error as { headers?: Headers } | undefined)
                )?.headers
                const retryAfter = headers?.get?.('Retry-After')
                if (retryAfter) {
                  const seconds = Number.parseInt(retryAfter, 10)
                  if (!Number.isNaN(seconds)) return seconds * 1000
                  // HTTP-date form. A past or invalid date falls back to backoff.
                  const delay = Date.parse(retryAfter) - Date.now()
                  if (delay > 0) return delay
                }
                return ~~(1 << count) * retryDelay
              },
              retryCount,
              signal,
              shouldRetry: ({ error }) => shouldRetry(error),
            },
          ),
        { enabled: dedupe, id: requestId },
      )
    } catch (error) {
      // A JSON-RPC error from a non-2xx response retries by its HTTP status,
      // then surfaces as the JSON-RPC error with the HTTP error (`status`,
      // `headers`) as its `cause`.
      if (error instanceof RpcClient.HttpError && error.rpcError) {
        const rpcError = RpcResponse.parseError(error.rpcError)
        // `RpcResponse` error subclasses take no `cause`, so set it afterwards.
        ;(rpcError as { cause: Error | undefined }).cause = error
        httpErrors.set(rpcError, error)
        throw rpcError
      }
      throw error
    }
  }
  return requestFn as RequestFn
}

export declare namespace wrapRequest {
  type Options = {
    /** Whether to deduplicate identical in-flight requests. */
    dedupe?: boolean | undefined
    /** RPC methods to include or exclude from execution. */
    methods?:
      | { include?: string[] | undefined }
      | { exclude?: string[] | undefined }
      | undefined
    /** The max number of times to retry. @default 3 */
    retryCount?: number | undefined
    /** The base delay (in ms) between retries. @default 150 */
    retryDelay?: number | undefined
    /** Signal to abort the request and any pending retries. */
    signal?: AbortSignal | undefined
    /** Unique id seeding the dedupe cache key. */
    uid?: string | undefined
  }
}

/**
 * HTTP errors behind the JSON-RPC errors they surface as. An outer request
 * layer (such as the `fallback` transport's) still retries them by HTTP status
 * and `Retry-After`.
 */
const httpErrors = new WeakMap<Error, RpcClient.HttpError>()

/** @internal */
export function shouldRetry(error: Error): boolean {
  const httpError =
    error instanceof RpcClient.HttpError ? error : httpErrors.get(error)
  const code = httpError
    ? httpError.rpcError?.code
    : (error as { code?: unknown }).code
  const status = (httpError ?? (error as { status?: unknown })).status
  if (typeof code === 'number') {
    if (code === -1) return true // unknown
    if (code === -32005 || code === -32007) return true // limit exceeded
    if (code === -32603) return true // internal
    if (code === 429) return true // too many requests (JSON-RPC body form)
    // The node does not serve the method, so a retry gets the same refusal
    // whatever the HTTP status (e.g. a 403 refusing an unserved method).
    if (code === RpcResponse.MethodNotFoundError.code) return false
    if (code === RpcResponse.MethodNotSupportedError.code) return false
    // A JSON-RPC error from a non-2xx response also retries by its HTTP status.
    if (typeof status !== 'number') return false
  }
  if (typeof status === 'number')
    return [403, 408, 413, 429, 500, 502, 503, 504].includes(status)
  return true
}

/** @internal cyrb53 — fast, non-cryptographic 53-bit string hash. */
function hashString(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 16), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 16), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}
