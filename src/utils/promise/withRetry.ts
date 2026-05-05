import {
  type ErrorType,
  getAbortError,
  isAbortError,
} from '../../errors/utils.js'
import { wait } from '../wait.js'

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
