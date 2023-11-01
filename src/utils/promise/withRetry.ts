import type { ErrorType } from '../../errors/utils.js'
import { wait } from '../wait.js'

export type WithRetryErrorType = ErrorType

export function withRetry<TData>(
  fn: () => Promise<TData>,
  {
    delay: delay_ = 100,
    retryCount = 2,
    shouldRetry = () => true,
  }: {
    // The delay (in ms) between retries.
    delay?: ((config: { count: number; error: Error }) => number) | number
    // The max number of times to retry.
    retryCount?: number
    // Whether or not to retry when an error is thrown.
    shouldRetry?: ({
      count,
      error,
    }: {
      count: number
      error: Error
    }) => Promise<boolean> | boolean
  } = {},
) {
  return new Promise<TData>((resolve, reject) => {
    const attemptRetry = async ({ count = 0 } = {}) => {
      const retry = async ({ error }: { error: Error }) => {
        const delay =
          typeof delay_ === 'function' ? delay_({ count, error }) : delay_
        if (delay) await wait(delay)
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
