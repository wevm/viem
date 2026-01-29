import type { ErrorType } from '../errors/utils.js'
import { wait } from './wait.js'

type PollOptions<data> = {
  // Whether or not to emit when the polling starts.
  emitOnBegin?: boolean | undefined
  // The initial wait time (in ms) before polling.
  initialWaitTime?: ((data: data | void) => Promise<number>) | undefined
  // The interval (in ms).
  interval: number
}

export type PollErrorType = ErrorType

/**
 * @description Polls a function at a specified interval.
 */
export function poll<data>(
  fn: ({ unpoll }: { unpoll: () => void }) => Promise<data | void>,
  { emitOnBegin, initialWaitTime, interval }: PollOptions<data>,
) {
  let active = true

  const unwatch = () => (active = false)

  const watch = async () => {
    let data: data | void = undefined
    if (emitOnBegin) data = await fn({ unpoll: unwatch })

    const initialWait = (await initialWaitTime?.(data)) ?? interval
    await wait(initialWait)

    const poll = async () => {
      if (!active) return
      await fn({ unpoll: unwatch })
      await wait(interval)
      poll()
    }

    poll()
  }
  watch()

  return unwatch
}
