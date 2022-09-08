import { wait } from '../wait'

export function withRetry<TData>(
  fn: () => Promise<TData>,
  {
    delay: delay_ = 100,
    retryCount = 2,
    shouldRetryOnResponse = () => false,
    shouldRetryOnError = () => false,
  }: {
    // The delay (in ms) between retries.
    delay?: ((config: { count: number; data?: TData }) => number) | number
    // The max number of times to retry.
    retryCount?: number
    // Whether or not to retry on a successful response.
    shouldRetryOnResponse?: ({
      count,
      data,
    }: {
      count: number
      data: TData
    }) => Promise<boolean> | boolean
    // Whether or not to retry when an error is thrown.
    shouldRetryOnError?: ({
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
      const retry = async ({ data }: { data?: TData } = {}) => {
        const delay =
          typeof delay_ === 'function' ? delay_({ count, data }) : delay_
        if (delay) await wait(delay)
        attemptRetry({ count: count + 1 })
      }

      try {
        const data = await fn()
        if (
          count < retryCount &&
          (await shouldRetryOnResponse({ count, data }))
        )
          return retry({ data })
        resolve(data)
      } catch (err) {
        if (
          count < retryCount &&
          (await shouldRetryOnError({ count, error: <Error>err }))
        )
          return retry()
        reject(err)
      }
    }
    attemptRetry()
  })
}
