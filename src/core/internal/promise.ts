import * as Errors from '../Errors.js'

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
