import * as Provider from 'ox/Provider'
import * as RpcResponse from 'ox/RpcResponse'

import { BaseError } from '../BaseError.js'
import { getAbortError, isAbortError } from './errors.js'
import { withDedupe, withRetry } from './promise.js'
import { HttpRequestError } from './request.js'
import { stringify } from './stringify.js'

export type Request = {
  method: string
  params?: unknown | undefined
}

export type RequestFn = (
  request: Request,
  options?: RequestOptions | undefined,
) => Promise<unknown>

export type RequestOptions = {
  signal?: AbortSignal | undefined
}

export type Methods = {
  exclude?: readonly string[] | undefined
  include?: readonly string[] | undefined
}

export function buildRequest<request extends RequestFn>(
  request: request,
  options: buildRequest.Options = {},
): buildRequest.ReturnType<request> {
  return (async (args, overrideOptions = {}) => {
    const {
      dedupe = false,
      methods,
      retryDelay = 150,
      retryCount = 3,
      signal,
      uid,
    } = {
      ...options,
      ...overrideOptions,
    }

    const { method } = args
    if (methods?.exclude?.includes(method))
      throw new RpcResponse.MethodNotSupportedError({
        message: `Method "${method}" is not supported.`,
      })
    if (methods?.include && !methods.include.includes(method))
      throw new RpcResponse.MethodNotSupportedError({
        message: `Method "${method}" is not supported.`,
      })

    if (signal?.aborted) throw getAbortError(signal)

    const requestId = dedupe
      ? hashString(`${uid}.${stringify(args)}`)
      : undefined

    return withDedupe(
      () =>
        withRetry(
          async () => {
            try {
              return await request(args, signal ? { signal } : undefined)
            } catch (error) {
              if (signal?.aborted) throw getAbortError(signal)
              if (isAbortError(error)) throw error
              if (error instanceof BaseError && !('code' in error)) throw error
              throw Provider.parseError(error)
            }
          },
          {
            delay: ({ count, error }) => {
              if (error instanceof HttpRequestError) {
                const retryAfter = error.headers?.get('Retry-After')
                if (retryAfter?.match(/\d/))
                  return Number.parseInt(retryAfter, 10) * 1000
              }
              return (1 << count) * retryDelay
            },
            retryCount,
            signal,
            shouldRetry: ({ error }) => shouldRetry(error),
          },
        ),
      { enabled: dedupe, id: requestId },
    )
  }) as buildRequest.ReturnType<request>
}

export declare namespace buildRequest {
  type Options = {
    dedupe?: boolean | undefined
    methods?: Methods | undefined
    retryCount?: number | undefined
    retryDelay?: number | undefined
    signal?: AbortSignal | undefined
    uid?: string | undefined
  }

  type OverrideOptions = Options

  type ReturnType<request extends RequestFn = RequestFn> = (
    args: Parameters<request>[0],
    options?: OverrideOptions | undefined,
  ) => RequestReturnType<request>
}

type RequestReturnType<request extends RequestFn> = request extends (
  request: Request,
  options?: RequestOptions | undefined,
) => infer returnType
  ? returnType
  : never

export function shouldRetry(error: Error) {
  if (isAbortError(error)) return false
  if ('code' in error && typeof error.code === 'number') {
    if (error.code === -1) return true
    if (error.code === RpcResponse.LimitExceededError.code) return true
    if (error.code === RpcResponse.InternalError.code) return true
    if (error.code === 429) return true
    return false
  }
  if (error instanceof HttpRequestError && error.status) {
    if (error.status === 403) return true
    if (error.status === 408) return true
    if (error.status === 413) return true
    if (error.status === 429) return true
    if (error.status === 500) return true
    if (error.status === 502) return true
    if (error.status === 503) return true
    if (error.status === 504) return true
    return false
  }
  return true
}

export declare namespace shouldRetry {
  type ErrorType = never
}

function hashString(value: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let index = 0; index < value.length; index++) {
    const character = value.charCodeAt(index)
    h1 = Math.imul(h1 ^ character, 2654435761)
    h2 = Math.imul(h2 ^ character, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 16), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 16), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}
