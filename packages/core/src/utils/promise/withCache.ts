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

export async function withCache<TData>(
  fn: () => Promise<TData>,
  { cacheKey, maxAge = Infinity }: { cacheKey: string; maxAge?: number },
) {
  const cache = getCache<TData>(cacheKey)

  const response = cache.response.get()
  if (response && maxAge > 0) {
    const age = new Date().getTime() - response.created.getTime()
    if (age < maxAge) return response.data
  }

  let promise = cache.promise.get()
  if (!promise) {
    promise = fn()
    cache.promise.set(promise)
  }

  const data = await promise

  cache.promise.clear()
  cache.response.set({ created: new Date(), data })

  return data
}
