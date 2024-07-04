import type { ErrorType } from '../../errors/utils.js'

/** @internal */
export const promiseCache = /*#__PURE__*/ new Map()
/** @internal */
export const responseCache = /*#__PURE__*/ new Map()

export type GetCacheErrorType = ErrorType

export function getCache<TData>(cacheKey: string) {
  const buildCache = <TData>(cacheKey: string, cache: Map<string, TData>) => ({
    clear: () => cache.delete(cacheKey),
    get: () => cache.get(cacheKey),
    set: (data: TData) => cache.set(cacheKey, data),
  })

  const promise = buildCache<Promise<TData>>(cacheKey, promiseCache)
  const response = buildCache<{ created: Date; data: TData }>(
    cacheKey,
    responseCache,
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

type WithCacheParameters = {
  /** The key to cache the data against. */
  cacheKey: string
  /** The time that cached data will remain in memory. Default: Infinity (no expiry) */
  cacheTime?: number | undefined
}

/**
 * @description Returns the result of a given promise, and caches the result for
 * subsequent invocations against a provided cache key.
 */
export async function withCache<TData>(
  fn: () => Promise<TData>,
  { cacheKey, cacheTime = Number.POSITIVE_INFINITY }: WithCacheParameters,
) {
  const cache = getCache<TData>(cacheKey)

  // If a response exists in the cache, and it's not expired, return it
  // and do not invoke the promise.
  // If the max age is 0, the cache is disabled.
  const response = cache.response.get()
  if (response && cacheTime > 0) {
    const age = new Date().getTime() - response.created.getTime()
    if (age < cacheTime) return response.data
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
