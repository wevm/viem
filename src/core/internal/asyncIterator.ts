import { withResolvers } from './promise.js'

/**
 * Creates a latest-only iterator from a source's data, error, and end events.
 * The source returns a function that unregisters the iterator's listeners.
 *
 * @internal
 */
export function createAsyncIterator<value extends object>(
  subscribe: createAsyncIterator.Subscribe<value>,
): AsyncIterableIterator<value> {
  let latest: value | undefined
  let error: Error | undefined
  type Pending = {
    resolve: (result: IteratorResult<value>) => void
    reject: (error: Error) => void
  }
  let pending: Pending | undefined
  let done = false

  const cleanup = subscribe(
    (value) => {
      if (pending) {
        const { resolve } = pending
        pending = undefined
        resolve({ done: false, value })
      } else latest = value
    },
    (err) => {
      if (pending) {
        const { reject } = pending
        pending = undefined
        done = true
        cleanup()
        reject(err)
      } else error = err
    },
    end,
  )

  function end() {
    done = true
    cleanup()
    if (pending) {
      const { resolve } = pending
      pending = undefined
      resolve({ done: true, value: undefined })
    }
  }

  return {
    next() {
      if (latest) {
        const value = latest
        latest = undefined
        return Promise.resolve({ done: false, value })
      }
      if (error) {
        const err = error
        error = undefined
        done = true
        cleanup()
        return Promise.reject(err)
      }
      if (done) return Promise.resolve({ done: true, value: undefined })
      const { promise, resolve, reject } =
        withResolvers<IteratorResult<value>>()
      pending = { reject, resolve }
      return promise
    },
    return() {
      end()
      return Promise.resolve({ done: true, value: undefined })
    },
    [Symbol.asyncIterator]() {
      return this
    },
  }
}

export declare namespace createAsyncIterator {
  type Subscribe<value> = (
    onData: (value: value) => void,
    onError: (error: Error) => void,
    end: () => void,
  ) => () => void
}
