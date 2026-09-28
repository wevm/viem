const promiseCache = /*#__PURE__*/ new Map<string, Promise<any>>()
const responseCache = /*#__PURE__*/ new Map<
  string,
  { created: number; data: any }
>()

/**
 * Returns the result of a given promise, and caches the result for subsequent
 * invocations against a provided cache key.
 */
export async function withCache<data>(
  fn: () => Promise<data>,
  options: withCache.Options,
): Promise<data> {
  const { cacheKey, cacheTime = Number.POSITIVE_INFINITY } = options

  // If a fresh response exists in the cache, return it without invoking `fn`.
  // `cacheTime` of `0` disables the cache.
  const response = responseCache.get(cacheKey)
  if (response && cacheTime > 0) {
    const age = Date.now() - response.created
    if (age < cacheTime) return response.data
  }

  // Reuse an in-flight promise so concurrent invocations dedupe onto it.
  const promise = promiseCache.get(cacheKey) ?? fn()
  promiseCache.set(cacheKey, promise)

  try {
    const data = await promise
    responseCache.set(cacheKey, { created: Date.now(), data })
    return data
  } finally {
    promiseCache.delete(cacheKey)
  }
}

export declare namespace withCache {
  type Options = {
    /** The key to cache the data against. */
    cacheKey: string
    /** Time (ms) the cached data stays fresh. @default Infinity */
    cacheTime?: number | undefined
  }
}
