import { getAbortError } from './errors.js'

export async function wait(
  time: number,
  options: wait.Options = {},
): wait.ReturnType {
  const { signal } = options
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(getAbortError(signal))
      return
    }

    const cleanup = () => signal?.removeEventListener('abort', onAbort)
    const timeout = setTimeout(() => {
      cleanup()
      resolve()
    }, time)
    const onAbort = () => {
      clearTimeout(timeout)
      cleanup()
      reject(getAbortError(signal))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export declare namespace wait {
  type Options = {
    signal?: AbortSignal | undefined
  }

  type ReturnType = Promise<void>
}
