import { getAbortError } from '../errors/utils.js'

export async function wait(
  time: number,
  { signal }: { signal?: AbortSignal | undefined } = {},
) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(getAbortError(signal))
      return
    }

    const cleanup = () => signal?.removeEventListener('abort', onAbort)
    // `setTimeout` fires after 1ms for delays above the 32-bit limit (~24.8 days).
    const timeout = setTimeout(
      () => {
        cleanup()
        resolve()
      },
      Math.min(time, 2 ** 31 - 1),
    )
    const onAbort = () => {
      clearTimeout(timeout)
      cleanup()
      reject(getAbortError(signal))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
