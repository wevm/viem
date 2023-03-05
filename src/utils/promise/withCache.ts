export const promiseCache = new Map()
export const responseCache = new Map()

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

export type WithCacheParameters = {
  /** The key to cache the data against. */
  cacheKey: string
  /** The maximum age (in ms) of the cached value. Default: Infinity (no expiry) */
  maxAge?: number
}

/**
 * @description Returns the result of a given promise, and caches the result for
 * subsequent invocations against a provided cache key.
 */
export async function withCache<TData>(
  fn: () => Promise<TData>,
  { cacheKey, maxAge = Infinity }: WithCacheParameters,
) {
  const cache = getCache<TData>(cacheKey)

  // If a response exists in the cache, and it's not expired, return it
  // and do not invoke the promise.
  // If the max age is 0, the cache is disabled.
  const response = cache.response.get()
  if (response && maxAge > 0) {
    const age = new Date().getTime() - response.created.getTime()
    if (age < maxAge) return response.data
  }

  let promise = cache.promise.get()
  if (!promise) {
    promise = fn()

    // Store the promise in the cache so that subsequent invocations
    // will wait for the same promise to resolve (deduping).
    cache.promise.set(promise)
  }

  const data = await promise

  // Clear the promise cache so that subsequent invocations will
  // invoke the promise again.
  cache.promise.clear()

  // Store the response in the cache so that subsequent invocations
  // will return the same response.
  cache.response.set({ created: new Date(), data })

  return data
}
