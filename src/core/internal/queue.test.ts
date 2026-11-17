import { describe, expect, test } from 'vitest'

import * as queue from './queue.js'
import { wait } from './wait.js'

describe('createQueue', () => {
  test('runs tasks and resolves with worker results in FIFO order', async () => {
    const order: number[] = []
    const q = queue.createQueue<number, number>({
      concurrency: 1,
      worker: async (task) => {
        order.push(task)
        return task * 2
      },
    })
    const results = await Promise.all([q.add(1), q.add(2), q.add(3)])
    expect(results).toEqual([2, 4, 6])
    expect(order).toEqual([1, 2, 3])
  })

  test('caps in-flight tasks at `concurrency`', async () => {
    let active = 0
    let max = 0
    const q = queue.createQueue<void, void>({
      concurrency: 2,
      worker: async () => {
        active++
        max = Math.max(max, active)
        await wait(50)
        active--
      },
    })
    await Promise.all(Array.from({ length: 6 }, () => q.add()))
    expect(max).toBe(2)
  })

  test('caps starts per wall-clock second at `frequency`', async () => {
    const buckets: number[] = []
    const q = queue.createQueue<void, void>({
      frequency: 2,
      worker: async () => {
        buckets.push(Math.floor(Date.now() / 1_000))
      },
    })
    await Promise.all(Array.from({ length: 5 }, () => q.add()))

    const counts = new Map<number, number>()
    for (const bucket of buckets)
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1)
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(2)
    expect(buckets).toHaveLength(5)
  })

  test('rejects when the worker throws', async () => {
    const q = queue.createQueue<void, void>({
      concurrency: 1,
      worker: async () => {
        throw new Error('boom')
      },
    })
    await expect(q.add()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: boom]`,
    )
  })
})
