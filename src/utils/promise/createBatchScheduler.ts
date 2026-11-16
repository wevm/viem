import type { ErrorType } from '../../errors/utils.js'
import { type PromiseWithResolvers, withResolvers } from './withResolvers.js'

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
  /**
   * Returns the size an item adds to its batch. Defaults to 1, so the size
   * counts items.
   */
  getSize?: ((args: parameters) => number) | undefined
  id: number | string
  /**
   * Returns whether a batch would be too large at `size` (the queued items
   * plus the next item), so the queued items flush before the next item joins.
   */
  shouldSplitBatch?: ((size: number) => boolean) | undefined
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

type Scheduler = { items: SchedulerItem[]; size: number }

const schedulerCache = /*#__PURE__*/ new Map<number | string, Scheduler>()
const timerCache = /*#__PURE__*/ new Map<
  number | string,
  ReturnType<typeof setTimeout>
>()

/** @internal */
export function createBatchScheduler<
  parameters,
  returnType extends readonly unknown[],
>({
  fn,
  getSize = () => 1,
  id,
  shouldSplitBatch,
  wait = 0,
  sort,
}: CreateBatchSchedulerArguments<
  parameters,
  returnType
>): CreateBatchSchedulerReturnType<parameters, returnType> {
  const exec = async () => {
    const scheduler = schedulerCache.get(id)?.items ?? []
    flush()

    const args = scheduler.map(({ args }) => args)

    if (args.length === 0) return

    // Wrap `fn` so that synchronous throws reject the scheduled promises.
    new Promise<returnType>((resolve) => resolve(fn(args as parameters[])))
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

  const flush = () => {
    clearTimeout(timerCache.get(id))
    timerCache.delete(id)
    schedulerCache.delete(id)
  }

  return {
    flush,
    async schedule(args: parameters) {
      const { promise, resolve, reject } = withResolvers()

      const size = getSize(args)
      const queued = schedulerCache.get(id)
      if (queued && shouldSplitBatch?.(queued.size + size)) exec()

      // Push in place: `exec` detaches the queue from the cache before it runs.
      const scheduler = schedulerCache.get(id)
      if (scheduler) {
        scheduler.items.push({ args, resolve, reject })
        scheduler.size += size
        return promise
      }

      schedulerCache.set(id, { items: [{ args, resolve, reject }], size })
      timerCache.set(id, setTimeout(exec, wait))
      return promise
    },
  } as unknown as CreateBatchSchedulerReturnType<parameters, returnType>
}
