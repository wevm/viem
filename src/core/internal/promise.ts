import { getAbortError, isAbortError } from './errors.js'
import { LruMap } from './lru.js'
import { wait } from './wait.js'

export const promiseCache = new Map<string, Promise<unknown>>()

export const responseCache = new Map<string, { created: Date; data: unknown }>()

const dedupeCache = new LruMap<Promise<unknown>>(8192)

const schedulerCache = new Map<number | string, SchedulerItem[]>()

type SchedulerItem<returnType extends readonly unknown[] = readonly unknown[]> =
  {
    args: unknown
    reject: withResolvers.ReturnType<
      createBatchScheduler.Resolved<returnType>
    >['reject']
    resolve: withResolvers.ReturnType<
      createBatchScheduler.Resolved<returnType>
    >['resolve']
  }

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

/** Deduplicates in-flight promises. */
export function withDedupe<data>(
  fn: () => Promise<data>,
  options: withDedupe.Options = {},
): withDedupe.ReturnType<data> {
  const { enabled = true, id } = options
  if (!enabled || !id) return fn()
  const cached = dedupeCache.get(id)
  if (cached) return cached as Promise<data>
  const promise = fn().finally(() => dedupeCache.delete(id))
  dedupeCache.set(id, promise)
  return promise
}

export declare namespace withDedupe {
  type Options = {
    enabled?: boolean | undefined
    id?: string | undefined
  }

  type ReturnType<data> = Promise<data>
}

export function withRetry<data>(
  fn: () => Promise<data>,
  options: withRetry.Options = {},
): withRetry.ReturnType<data> {
  const {
    delay = 100,
    retryCount = 2,
    shouldRetry = () => true,
    signal,
  } = options

  return new Promise((resolve, reject) => {
    const attemptRetry = async (options: { count?: number } = {}) => {
      const { count = 0 } = options
      if (signal?.aborted) {
        reject(getAbortError(signal))
        return
      }

      const retry = async ({ error }: { error: Error }) => {
        const retryDelay =
          typeof delay === 'function' ? delay({ count, error }) : delay
        if (retryDelay) {
          try {
            await wait(retryDelay, { signal })
          } catch (error) {
            reject(error)
            return
          }
        }
        attemptRetry({ count: count + 1 })
      }

      try {
        resolve(await fn())
      } catch (error) {
        if (signal?.aborted) {
          reject(getAbortError(signal))
          return
        }
        if (isAbortError(error)) {
          reject(error)
          return
        }
        if (
          count < retryCount &&
          (await shouldRetry({ count, error: error as Error }))
        )
          return retry({ error: error as Error })
        reject(error)
      }
    }
    attemptRetry()
  })
}

export declare namespace withRetry {
  type Options = {
    delay?:
      | ((options: { count: number; error: Error }) => number)
      | number
      | undefined
    retryCount?: number | undefined
    shouldRetry?:
      | ((options: {
          count: number
          error: Error
        }) => boolean | Promise<boolean>)
      | undefined
    signal?: AbortSignal | undefined
  }

  type ReturnType<data> = Promise<data>
}

export function withTimeout<data>(
  fn: (options: { signal: AbortSignal | null }) => Promise<data>,
  options: withTimeout.Options,
): withTimeout.ReturnType<data> {
  const { errorInstance = new Error('timed out'), signal, timeout } = options

  return new Promise((resolve, reject) => {
    ;(async () => {
      let timeoutId: NodeJS.Timeout | undefined
      const controller = new AbortController()
      try {
        if (timeout > 0)
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort()
              return
            }
            reject(errorInstance)
          }, timeout)
        resolve(await fn({ signal: controller.signal }))
      } catch (error) {
        if (controller.signal.aborted && isAbortError(error)) {
          reject(errorInstance)
          return
        }
        reject(error)
      } finally {
        clearTimeout(timeoutId)
      }
    })()
  })
}

export declare namespace withTimeout {
  type Options = {
    errorInstance?: Error | undefined
    signal?: boolean | undefined
    timeout: number
  }

  type ReturnType<data> = Promise<data>
}

export function withResolvers<data>(): withResolvers.ReturnType<data> {
  let resolve: withResolvers.ReturnType<data>['resolve'] = () => undefined
  let reject: withResolvers.ReturnType<data>['reject'] = () => undefined

  const promise = new Promise<data>((resolve_, reject_) => {
    resolve = resolve_
    reject = reject_
  })

  return { promise, reject, resolve }
}

export declare namespace withResolvers {
  type ReturnType<data> = {
    promise: Promise<data>
    reject: (reason?: unknown) => void
    resolve: (value: PromiseLike<data> | data) => void
  }
}

export function createBatchScheduler<
  parameters,
  returnType extends readonly unknown[],
>(
  options: createBatchScheduler.Options<parameters, returnType>,
): createBatchScheduler.ReturnType<parameters, returnType> {
  const { fn, id, shouldSplitBatch, sort, wait = 0 } = options

  const exec = async () => {
    const scheduler = getScheduler()
    flush()

    const args = scheduler.map(({ args }) => args)
    if (args.length === 0) return

    fn(args as parameters[])
      .then((data) => {
        if (sort && Array.isArray(data))
          (data as unknown[]).sort(sort as (a: unknown, b: unknown) => number)
        const results = data
        for (let index = 0; index < scheduler.length; index++) {
          const item = scheduler[index]
          item?.resolve([results[index], results])
        }
      })
      .catch((error) => {
        for (const { reject } of scheduler) reject(error)
      })
  }

  const flush = () => {
    schedulerCache.delete(id)
  }

  const getBatchedArgs = () =>
    getScheduler().map(({ args }) => args) as parameters[]

  const getScheduler = () =>
    (schedulerCache.get(id) ?? []) as SchedulerItem<returnType>[]

  const setScheduler = (item: SchedulerItem<returnType>) =>
    schedulerCache.set(id, [...getScheduler(), item] as SchedulerItem[])

  return {
    flush,
    async schedule(args: parameters) {
      const { promise, reject, resolve } =
        withResolvers<createBatchScheduler.Resolved<returnType>>()

      const split = shouldSplitBatch?.([...getBatchedArgs(), args])
      if (split) exec()

      const hasActiveScheduler = getScheduler().length > 0
      if (hasActiveScheduler) {
        setScheduler({ args, reject, resolve })
        return promise
      }

      setScheduler({ args, reject, resolve })
      setTimeout(exec, wait)
      return promise
    },
  } as unknown as createBatchScheduler.ReturnType<parameters, returnType>
}

export declare namespace createBatchScheduler {
  type Compare<result = unknown> = (a: result, b: result) => number

  type Options<
    parameters = unknown,
    returnType extends readonly unknown[] = readonly unknown[],
  > = {
    fn: (args: parameters[]) => Promise<returnType>
    id: number | string
    shouldSplitBatch?: ((args: parameters[]) => boolean) | undefined
    sort?: Compare<returnType[number]> | undefined
    wait?: number | undefined
  }

  type Resolved<returnType extends readonly unknown[] = readonly unknown[]> = [
    result: returnType[number],
    results: returnType,
  ]

  type ReturnType<
    parameters = unknown,
    returnType extends readonly unknown[] = readonly unknown[],
  > = {
    flush: () => void
    schedule: parameters extends undefined
      ? (args?: parameters | undefined) => Promise<Resolved<returnType>>
      : (args: parameters) => Promise<Resolved<returnType>>
  }
}
