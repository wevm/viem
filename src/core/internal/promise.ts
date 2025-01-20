import * as Caches from '../Caches.js'
import * as Errors from '../Errors.js'
export type SchedulerItem = {
  args: unknown
  resolve: PromiseWithResolvers<unknown>['resolve']
  reject: PromiseWithResolvers<unknown>['reject']
}

/** @internal */
export function createBatchScheduler<
  parameters,
  returnType extends readonly unknown[],
>(
  parameters: createBatchScheduler.Parameters<parameters, returnType>,
): createBatchScheduler.ReturnType<parameters, returnType> {
  const { fn, id, shouldSplitBatch, wait, sort } = parameters

  const exec = async () => {
    const scheduler = getScheduler()
    flush()

    const args = scheduler.map(({ args }) => args)

    if (args.length === 0) return

    fn(args as parameters[])
      .then((data) => {
        if (sort && Array.isArray(data)) data.sort(sort)
        for (let i = 0; i < scheduler.length; i++) {
          const { resolve } = scheduler[i]!
          resolve?.([data[i], data])
        }
      })
      .catch((err) => {
        for (let i = 0; i < scheduler.length; i++) {
          const { reject } = scheduler[i]!
          reject?.(err)
        }
      })
  }

  const flush = () => Caches.scheduler.delete(id)

  const getBatchedArgs = () =>
    getScheduler().map(({ args }) => args) as parameters[]

  const getScheduler = () => Caches.scheduler.get(id) || []

  const setScheduler = (item: SchedulerItem) =>
    Caches.scheduler.set(id, [...getScheduler(), item])

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
  } as unknown as createBatchScheduler.ReturnType<parameters, returnType>
}

export declare namespace createBatchScheduler {
  type CmpFn<result = unknown> = (a: result, b: result) => number

  type Resolved<returnType extends readonly unknown[] = any> = [
    result: returnType[number],
    results: returnType,
  ]

  type Parameters<
    parameters = unknown,
    returnType extends readonly unknown[] = readonly unknown[],
  > = {
    fn: (args: parameters[]) => Promise<returnType>
    id: number | string
    shouldSplitBatch?: ((args: parameters[]) => boolean) | undefined
    wait?: number | undefined
    sort?: CmpFn<returnType[number]> | undefined
  }

  type ReturnType<
    parameters = unknown,
    returnType extends readonly unknown[] = readonly unknown[],
  > = {
    flush: () => void
    schedule: parameters extends undefined
      ? (args?: parameters | undefined) => Promise<Resolved<returnType>>
      : (args: parameters) => Promise<Resolved<returnType>>
  }

  type ErrorType = Errors.GlobalErrorType
}

/** @internal */
export function withDedupe<data>(
  fn: () => Promise<data>,
  options: withDedupe.Options = {},
): Promise<data> {
  const { enabled = true, id } = options
  if (!enabled || !id) return fn()
  if (Caches.dedupe.get(id)) return Caches.dedupe.get(id)!
  const promise = fn().finally(() => Caches.dedupe.delete(id))
  Caches.dedupe.set(id, promise)
  return promise
}

/** @internal */
export declare namespace withDedupe {
  type Options = {
    enabled?: boolean | undefined
    id?: string | undefined
  }

  type ErrorType = Errors.GlobalErrorType
}

/** @internal */
export type WithResolvers<type> = {
  promise: Promise<type>
  resolve: (value: type | PromiseLike<type>) => void
  reject: (reason?: unknown) => void
}

/** @internal */
export function withResolvers<type>(): WithResolvers<type> {
  let resolve: WithResolvers<type>['resolve'] = () => undefined
  let reject: WithResolvers<type>['reject'] = () => undefined

  const promise = new Promise<type>((resolve_, reject_) => {
    resolve = resolve_
    reject = reject_
  })

  return { promise, resolve, reject }
}

/** @internal */
export function withRetry<data>(
  fn: () => Promise<data>,
  {
    delay: delay_ = 100,
    retryCount = 2,
    shouldRetry = () => true,
  }: withRetry.Options = {},
) {
  return new Promise<data>((resolve, reject) => {
    const attemptRetry = async ({ count = 0 } = {}) => {
      const retry = async ({ error }: { error: Error }) => {
        const delay =
          typeof delay_ === 'function' ? delay_({ count, error }) : delay_
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
        attemptRetry({ count: count + 1 })
      }

      try {
        const data = await fn()
        resolve(data)
      } catch (err) {
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

export declare namespace withRetry {
  type Options = {
    /** The delay (in ms) between retries. */
    delay?:
      | ((config: { count: number; error: Error }) => number)
      | number
      | undefined
    /** The max number of times to retry. */
    retryCount?: number | undefined
    /** Whether or not to retry when an error is thrown. */
    shouldRetry?:
      | (({
          count,
          error,
        }: {
          count: number
          error: Error
        }) => Promise<boolean> | boolean)
      | undefined
  }

  type ErrorType = Errors.GlobalErrorType
}

/** @internal */
export function withTimeout<data>(
  fn: withTimeout.Fn<data>,
  options: withTimeout.Options,
): Promise<data> {
  const { errorInstance = new TimeoutError(), timeout, signal } = options
  return new Promise((resolve, reject) => {
    ;(async () => {
      let timeoutId: any
      try {
        const controller = new AbortController()
        if (timeout > 0)
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort()
            } else {
              reject(errorInstance)
            }
          }, timeout) as any
        resolve(await fn({ signal: controller.signal }))
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') reject(errorInstance)
        reject(err)
      } finally {
        clearTimeout(timeoutId)
      }
    })()
  })
}

/** @internal */
export declare namespace withTimeout {
  type Fn<data> = ({
    signal,
  }: { signal: AbortController['signal'] | null }) => Promise<data>

  type Options = {
    // The error instance to throw when the timeout is reached.
    errorInstance?: Error | undefined
    // The timeout (in ms).
    timeout: number
    // Whether or not the timeout should use an abort signal.
    signal?: boolean | undefined
  }

  type ErrorType = TimeoutError | Errors.GlobalErrorType
}

/** @internal */

/**
 * Thrown when an operation times out.
 * @internal
 */
export class TimeoutError extends Errors.BaseError {
  override readonly name = 'Promise.TimeoutError'

  constructor() {
    super('Operation timed out.')
  }
}
