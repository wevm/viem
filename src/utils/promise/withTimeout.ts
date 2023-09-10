export function withTimeout<TData>(
  fn: ({ signal }: { signal?: AbortController['signal'] }) => Promise<TData>,
  {
    errorInstance,
    timeout,
    signal,
  }: {
    // The error instance to throw when the timeout is reached.
    errorInstance: Error
    // The timeout (in ms).
    timeout: number
    // Whether or not the timeout should use an abort signal.
    signal?: boolean
  },
): Promise<TData> {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let timeoutId!: NodeJS.Timeout
      try {
        const controller = new AbortController()
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort()
            } else {
              reject(errorInstance)
            }
          }, timeout)
        }
        resolve(await fn({ signal: controller?.signal }))
      } catch (err) {
        if ((err as Error).name === 'AbortError') reject(errorInstance)
        reject(err)
      } finally {
        clearTimeout(timeoutId)
      }
    })()
  })
}
