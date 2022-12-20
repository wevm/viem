import { wait } from './wait'

export function poll<TData>(
  fn: ({ unwatch }: { unwatch: () => void }) => Promise<TData | void>,
  {
    emitOnBegin,
    initialWaitTime,
    interval,
  }: {
    // Whether or not to emit when the polling starts.
    emitOnBegin?: boolean
    // The initial wait time (in ms) before polling.
    initialWaitTime?: (data: TData | void) => Promise<number>
    // The interval (in ms).
    interval: number
  },
) {
  let active = true

  const unwatch = () => (active = false)

  const watch = async () => {
    let data: TData | void
    if (emitOnBegin) data = await fn({ unwatch })

    const initialWait = (await initialWaitTime?.(data)) ?? interval
    await wait(initialWait)

    const poll = async () => {
      if (!active) return
      await fn({ unwatch })
      await wait(interval)
      poll()
    }

    poll()
  }
  watch()

  return unwatch
}
