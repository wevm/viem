import { wait } from './wait'

export function poll<TData>(
  fn: () => Promise<TData>,
  {
    emitOnOpen,
    initialWaitTime,
    onData,
    interval,
  }: {
    emitOnOpen?: boolean
    initialWaitTime?: (data: TData) => Promise<number>
    onData: (data: TData) => void
    interval: number
  },
) {
  let active = true

  fn().then(async (data) => {
    if (!active) return

    if (emitOnOpen) onData(data)

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
