export const promiseCache = new Map<string, Promise<unknown>>()

export const responseCache = new Map<string, { created: Date; data: unknown }>()

export function getCache<data>(cacheKey: string): getCache.ReturnType<data> {
  return {
    clear: () => {
      promiseCache.delete(cacheKey)
      responseCache.delete(cacheKey)
    },
    promise: {
      clear: () => promiseCache.delete(cacheKey),
      get: () => promiseCache.get(cacheKey) as Promise<data> | undefined,
      set: (data: Promise<data>) => promiseCache.set(cacheKey, data),
    },
    response: {
      clear: () => responseCache.delete(cacheKey),
      get: () =>
        responseCache.get(cacheKey) as
          | { created: Date; data: data }
          | undefined,
      set: (data: { created: Date; data: data }) =>
        responseCache.set(cacheKey, data),
    },
  }
}

export declare namespace getCache {
  type Entry<data> = { created: Date; data: data }

  type Store<data> = {
    clear: () => boolean
    get: () => data | undefined
    set: (data: data) => void
  }

  type ReturnType<data> = {
    clear: () => void
    promise: Store<Promise<data>>
    response: Store<Entry<data>>
  }
}

export async function withCache<data>(
  fn: () => Promise<data>,
  options: withCache.Options,
): withCache.ReturnType<data> {
  const { cacheKey, cacheTime = Number.POSITIVE_INFINITY } = options
  const cache = getCache<data>(cacheKey)

  const response = cache.response.get()
  if (response && cacheTime > 0) {
    const age = Date.now() - response.created.getTime()
    if (age < cacheTime) return response.data
  }

  let promise = cache.promise.get()
  if (!promise) {
    promise = fn()
    cache.promise.set(promise)
  }

  try {
    const data = await promise
    cache.response.set({ created: new Date(), data })
    return data
  } finally {
    cache.promise.clear()
  }
}

export declare namespace withCache {
  type Options = {
    cacheKey: string
    cacheTime?: number | undefined
  }

  type ReturnType<data> = Promise<data>
}
