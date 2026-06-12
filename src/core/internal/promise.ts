import { type ErrorType, getAbortError, isAbortError } from './errors.js'
import { LruMap } from './lru.js'
import { wait } from './wait.js'

/** @internal */
export type PromiseWithResolvers<type> = {
  promise: Promise<type>
  resolve: (value: type | PromiseLike<type>) => void
  reject: (reason?: unknown) => void
}

/** @internal */
export function withResolvers<type>(): PromiseWithResolvers<type> {
  let resolve: PromiseWithResolvers<type>['resolve'] = () => undefined
  let reject: PromiseWithResolvers<type>['reject'] = () => undefined

  const promise = new Promise<type>((resolve_, reject_) => {
    resolve = resolve_
    reject = reject_
  })

  return { promise, resolve, reject }
}

type Resolved<returnType extends readonly unknown[] = any> = [
  result: returnType[number],
  results: returnType,
]

type SchedulerItem = {
  args: unknown
  resolve: PromiseWithResolvers<unknown>['resolve']
  reject: PromiseWithResolvers<unknown>['reject']
}

type BatchResultsCompareFn<result = unknown> = (a: result, b: result) => number

type CreateBatchSchedulerArguments<
  parameters = unknown,
  returnType extends readonly unknown[] = readonly unknown[],
> = {
  fn: (args: parameters[]) => Promise<returnType>
  id: number | string
  shouldSplitBatch?: ((args: parameters[]) => boolean) | undefined
  wait?: number | undefined
  sort?: BatchResultsCompareFn<returnType[number]> | undefined
}

type CreateBatchSchedulerReturnType<
  parameters = unknown,
  returnType extends readonly unknown[] = readonly unknown[],
> = {
  flush: () => void
  schedule: parameters extends undefined
    ? (args?: parameters | undefined) => Promise<Resolved<returnType>>
    : (args: parameters) => Promise<Resolved<returnType>>
}

export type CreateBatchSchedulerErrorType = ErrorType

const schedulerCache = /*#__PURE__*/ new Map<number | string, SchedulerItem[]>()

/** @internal */
export function createBatchScheduler<
  parameters,
  returnType extends readonly unknown[],
>({
  fn,
  id,
  shouldSplitBatch,
  wait = 0,
  sort,
}: CreateBatchSchedulerArguments<
  parameters,
  returnType
>): CreateBatchSchedulerReturnType<parameters, returnType> {
  const exec = async () => {
    const scheduler = getScheduler()
    flush()

    const args = scheduler.map(({ args }) => args)

    if (args.length === 0) return

    fn(args as parameters[])
      .then((data) => {
        if (sort && Array.isArray(data)) data.sort(sort)
        for (let i = 0; i < scheduler.length; i++) {
          const { resolve } = scheduler[i]
          resolve?.([data[i], data])
        }
      })
      .catch((err) => {
        for (let i = 0; i < scheduler.length; i++) {
          const { reject } = scheduler[i]
          reject?.(err)
        }
      })
  }

  const flush = () => schedulerCache.delete(id)

  const getBatchedArgs = () =>
    getScheduler().map(({ args }) => args) as parameters[]

  const getScheduler = () => schedulerCache.get(id) || []

  const setScheduler = (item: SchedulerItem) =>
    schedulerCache.set(id, [...getScheduler(), item])

  return {
    flush,
    async schedule(args: parameters) {
      const { promise, resolve, reject } = withResolvers()

      const split = shouldSplitBatch?.([...getBatchedArgs(), args])

      if (split) exec()

      const hasActiveScheduler = getScheduler().length > 0
      if (hasActiveScheduler) {
        setScheduler({ args, resolve, reject })
        return promise
      }

      setScheduler({ args, resolve, reject })
      setTimeout(exec, wait)
      return promise
    },
  } as unknown as CreateBatchSchedulerReturnType<parameters, returnType>
}

/** @internal */
export const promiseCache = /*#__PURE__*/ new Map()
/** @internal */
export const responseCache = /*#__PURE__*/ new Map()

export type GetCacheErrorType = ErrorType

export function getCache<data>(cacheKey: string) {
  const buildCache = <data>(cacheKey: string, cache: Map<string, data>) => ({
    clear: () => cache.delete(cacheKey),
    get: () => cache.get(cacheKey),
    set: (data: data) => cache.set(cacheKey, data),
  })

  const promise = buildCache<Promise<data>>(cacheKey, promiseCache)
  const response = buildCache<{ created: Date; data: data }>(
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
export async function withCache<data>(
  fn: () => Promise<data>,
  { cacheKey, cacheTime = Number.POSITIVE_INFINITY }: WithCacheParameters,
) {
  const cache = getCache<data>(cacheKey)

  // If a response exists in the cache, and it's not expired, return it
  // and do not invoke the promise.
  // If the max age is 0, the cache is disabled.
  const response = cache.response.get()
  if (response && cacheTime > 0) {
    const age = Date.now() - response.created.getTime()
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

/** @internal */
export const dedupeCache = /*#__PURE__*/ new LruMap<Promise<any>>(8192)

type WithDedupeOptions = {
  enabled?: boolean | undefined
  id?: string | undefined
}

/** Deduplicates in-flight promises. */
export function withDedupe<data>(
  fn: () => Promise<data>,
  { enabled = true, id }: WithDedupeOptions,
): Promise<data> {
  if (!enabled || !id) return fn()
  if (dedupeCache.get(id)) return dedupeCache.get(id)!
  const promise = fn().finally(() => dedupeCache.delete(id))
  dedupeCache.set(id, promise)
  return promise
}

export type WithRetryParameters = {
  // The delay (in ms) between retries.
  delay?:
    | ((config: { count: number; error: Error }) => number)
    | number
    | undefined
  // The max number of times to retry.
  retryCount?: number | undefined
  // Whether or not to retry when an error is thrown.
  shouldRetry?:
    | (({
        count,
        error,
      }: {
        count: number
        error: Error
      }) => Promise<boolean> | boolean)
    | undefined
  // AbortSignal to cancel retries.
  signal?: AbortSignal | undefined
}

export type WithRetryErrorType = ErrorType

export function withRetry<data>(
  fn: () => Promise<data>,
  {
    delay: delay_ = 100,
    retryCount = 2,
    shouldRetry = () => true,
    signal,
  }: WithRetryParameters = {},
) {
  return new Promise<data>((resolve, reject) => {
    const attemptRetry = async ({ count = 0 } = {}) => {
      if (signal?.aborted) {
        reject(getAbortError(signal))
        return
      }

      const retry = async ({ error }: { error: Error }) => {
        const delay =
          typeof delay_ === 'function' ? delay_({ count, error }) : delay_
        if (delay) {
          try {
            await wait(delay, { signal })
          } catch (err) {
            reject(err)
            return
          }
        }
        attemptRetry({ count: count + 1 })
      }

      try {
        const data = await fn()
        resolve(data)
      } catch (err) {
        if (signal?.aborted) {
          reject(getAbortError(signal))
          return
        }
        if (isAbortError(err)) {
          reject(err)
          return
        }
        if (
          count < retryCount &&
          (await shouldRetry({ count, error: err as Error }))
        )
          return retry({ error: err as Error })
        reject(err)
      }
    }
    attemptRetry()
  })
}

export type WithTimeoutErrorType = ErrorType

export function withTimeout<data>(
  fn: ({
    signal,
  }: {
    signal: AbortController['signal'] | null
  }) => Promise<data>,
  {
    errorInstance = new Error('timed out'),
    timeout,
    signal,
  }: {
    // The error instance to throw when the timeout is reached.
    errorInstance?: Error | undefined
    // The timeout (in ms).
    timeout: number
    // Whether or not the timeout should use an abort signal.
    signal?: boolean | undefined
  },
): Promise<data> {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let timeoutId!: NodeJS.Timeout
      const controller = new AbortController()
      try {
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort()
            } else {
              reject(errorInstance)
            }
          }, timeout) as NodeJS.Timeout // need to cast because bun globals.d.ts overrides @types/node
        }
        resolve(await fn({ signal: controller?.signal || null }))
      } catch (err) {
        if (controller?.signal.aborted && isAbortError(err)) {
          reject(errorInstance)
          return
        }
        reject(err)
      } finally {
        clearTimeout(timeoutId)
      }
    })()
  })
}
