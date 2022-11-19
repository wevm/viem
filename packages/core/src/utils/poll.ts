import { wait } from './wait'

export function poll<TData>(
  fn: () => Promise<TData>,
  {
    emitOnBegin,
    initialWaitTime,
    onData,
    interval,
  }: {
    // Whether or not to emit when the polling starts.
    emitOnBegin?: boolean
    // The initial wait time (in ms) before polling.
    initialWaitTime?: (data: TData) => Promise<number>
    // The function to invoke when data is received.
    onData: (data: TData) => void
    // The interval (in ms).
    interval: number
  },
) {
  let active = true

  fn().then(async (data) => {
    if (!active) return

    if (emitOnBegin) onData(data)

    const initialWait = (await initialWaitTime?.(data)) ?? interval
    await wait(initialWait)

    const poll = async () => {
      if (!active) return
      const data = await fn()
      onData(data)
      await wait(interval)
      poll()
    }

    poll()
  })

  return () => (active = false)
}
