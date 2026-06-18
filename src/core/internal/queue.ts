import { withResolvers } from './promise.js'

/** A FIFO task queue bounded by `frequency` and/or `concurrency`. */
export type Queue<task, result> = {
  /** Enqueues a task, resolving when the worker completes it. */
  add: (task: task) => Promise<result>
}

/**
 * Creates a FIFO queue that runs tasks through `worker`, capped by an optional
 * `frequency` (max starts per wall-clock second) and `concurrency` (max
 * in-flight tasks).
 *
 * @internal
 */
export function createQueue<task, result>(
  options: createQueue.Options<task, result>,
): Queue<task, result> {
  const { concurrency, frequency, worker } = options

  type Item = {
    task: task
    resolve: (result: result) => void
    reject: (error: Error) => void
  }
  const queue: Item[] = []

  let pending = 0
  let requests = 0
  let timestamp = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const next = () => {
    const now = Date.now()

    // Reset the per-second budget when the wall-clock second changes.
    if (Math.floor(now / 1_000) !== timestamp) {
      requests = 0
      timestamp = Math.floor(now / 1_000)
    }

    if (timer) return

    while (
      (frequency === undefined || requests < frequency) &&
      (concurrency === undefined || pending < concurrency) &&
      queue.length > 0
    ) {
      const { task, resolve, reject } = queue.shift()!
      requests++
      pending++
      worker(task)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          pending--
          next()
        })
    }

    // Frequency budget exhausted: resume at the next second boundary.
    if (frequency !== undefined && requests >= frequency)
      timer = setTimeout(
        () => {
          timer = undefined
          next()
        },
        1_000 - (now % 1_000),
      )
  }

  return {
    add(task) {
      const { promise, resolve, reject } = withResolvers<result>()
      queue.push({ task, resolve, reject })
      next()
      return promise
    },
  }
}

export declare namespace createQueue {
  type Options<task, result> = {
    /** Max in-flight tasks. */
    concurrency?: number | undefined
    /** Max task starts per wall-clock second. */
    frequency?: number | undefined
    /** Runs each task. */
    worker: (task: task) => Promise<result>
  }
}
