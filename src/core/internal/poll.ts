import { wait } from './wait.js'

export function poll<data>(
  fn: poll.Function<data>,
  options: poll.Options<data>,
): poll.ReturnType {
  const { emitOnBegin, initialWaitTime, interval } = options
  let active = true

  const unpoll = () => (active = false)

  const watch = async () => {
    let data: data | undefined | void
    if (emitOnBegin) data = await fn({ unpoll })

    const initialWait = (await initialWaitTime?.(data)) ?? interval
    await wait(initialWait)

    const poll = async () => {
      if (!active) return
      await fn({ unpoll })
      await wait(interval)
      poll()
    }

    poll()
  }
  watch()

  return unpoll
}

export declare namespace poll {
  type Function<data> = (options: {
    unpoll: () => void
  }) => Promise<data | void>

  type Options<data> = {
    emitOnBegin?: boolean | undefined
    initialWaitTime?: ((data: data | void) => Promise<number>) | undefined
    interval: number
  }

  type ReturnType = () => void
}
