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
  id: number | string
  getBatchSize?: ((args: parameters[]) => number) | undefined
  wait?: number | undefined
  waitAsRateLimit?: boolean
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
  getBatchSize,
  wait = 0,
  waitAsRateLimit = false,
  sort,
}: CreateBatchSchedulerArguments<
  parameters,
  returnType
>): CreateBatchSchedulerReturnType<parameters, returnType> {
  const exec = async () => {
    const items = getBatchItems()
    const args = items.map(({ args }) => args)

    if (args.length === 0) {
      flush()
      return
    }

    fn(args as parameters[])
      .then((data) => {
        if (sort && Array.isArray(data)) data.sort(sort)
        for (let i = 0; i < items.length; i++) {
          const { resolve } = items[i]
          resolve?.([data[i], data])
        }
      })
      .catch((err) => {
        for (let i = 0; i < items.length; i++) {
          const { reject } = items[i]
          reject?.(err)
        }
      })

    if (waitAsRateLimit) {
      setTimeout(() => {
        clearBatchItems(items.length)
        exec()
      }, wait)
      return
    }

    clearBatchItems(items.length)
    exec()
  }

  const flush = () => schedulerCache.delete(id)

  const getScheduler = () => schedulerCache.get(id) || []
  const setScheduler = (item: SchedulerItem) =>
    schedulerCache.set(id, [...getScheduler(), item])
  const getBatchedArgs = () =>
    getScheduler().map(({ args }) => args) as parameters[]

  // if batchSize is undefined, it takes all items
  const batchSize = getBatchSize?.(getBatchedArgs())
  const getBatchItems = () => getScheduler().slice(0, batchSize)
  const clearBatchItems = (amount: number) =>
    schedulerCache.set(id, getScheduler().slice(amount))

  return {
    flush,
    async schedule(args: parameters) {
      const { promise, resolve, reject } = withResolvers()

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
