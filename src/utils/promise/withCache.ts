import type { ErrorType } from '../../errors/utils.js'

/** @internal */
export const promiseCache = /*#__PURE__*/ new Map()
/** @internal */
export const responseCache = /*#__PURE__*/ new Map()

export type GetCacheErrorType = ErrorType

export type WithCacheStore<data> = Pick<
  Map<string, data>,
  'delete' | 'get' | 'set'
>

type GetCacheParameters<data> = {
  promiseCache?: WithCacheStore<Promise<data>> | undefined
  responseCache?:
    | WithCacheStore<{
        created: Date
        data: data
      }>
    | undefined
}

export function getCache<data>(
  cacheKey: string,
  {
    promiseCache: promiseCache_ = promiseCache,
    responseCache: responseCache_ = responseCache,
  }: GetCacheParameters<data> = {},
) {
  const buildCache = <data>(cacheKey: string, cache: WithCacheStore<data>) => ({
    clear: () => cache.delete(cacheKey),
    get: () => cache.get(cacheKey),
    set: (data: data) => cache.set(cacheKey, data),
  })

  const promise = buildCache<Promise<data>>(cacheKey, promiseCache_)
  const response = buildCache<{ created: Date; data: data }>(
    cacheKey,
    responseCache_,
  )

  return {
    clear: () => {
      promise.clear()
      response.clear()
    },
    promise,
    response,
  }
}

export type WithCacheParameters<data = unknown> = GetCacheParameters<data> & {
  /** The key to cache the data against. */
  cacheKey: string
  /** The time that cached data will remain in memory. Default: Infinity (no expiry) */
  cacheTime?: number | undefined
}

/**
 * @description Returns the result of a given promise, and caches the result for
 * subsequent invocations against a provided cache key.
 */
export async function withCache<data>(
  fn: () => Promise<data>,
  {
    cacheKey,
    cacheTime = Number.POSITIVE_INFINITY,
    promiseCache,
    responseCache,
  }: WithCacheParameters<data>,
) {
  const cache = getCache<data>(cacheKey, {
    promiseCache,
    responseCache,
  })

  // If a response exists in the cache, and it's not expired, return it
  // and do not invoke the promise.
  // If the max age is 0, the cache is disabled.
  const response = cache.response.get()
  if (response) {
    if (cacheTime > 0) {
      const age = Date.now() - response.created.getTime()
      if (age < cacheTime) return response.data
    }

    cache.response.clear()
  }

  let promise = cache.promise.get()
  if (!promise) {
    promise = fn()

    // Store the promise in the cache so that subsequent invocations
    // will wait for the same promise to resolve (deduping).
    cache.promise.set(promise)
  }

  try {
    const data = await promise

    // Store the response in the cache so that subsequent invocations
    // will return the same response.
    cache.response.set({ created: new Date(), data })

    return data
  } finally {
    // Clear the promise cache so that subsequent invocations will
    // invoke the promise again.
    cache.promise.clear()
  }
}
