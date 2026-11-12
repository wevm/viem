import { describe, expect, test, vi } from 'vitest'

import { uid } from '../uid.js'
import { wait } from '../wait.js'

import { createBatchScheduler } from './createBatchScheduler.js'

test('default', async () => {
  const fn = vi.fn()
  const { schedule } = createBatchScheduler({
    id: uid(),
    // biome-ignore lint/complexity/noCommaOperator: _
    fn: async (args: number[]) => (fn(), args),
  })

  const p = []
  p.push(schedule(1))
  p.push(schedule(2))
  p.push(schedule(3))
  p.push(schedule(4))
  await wait(1)
  p.push(schedule(5))
  p.push(schedule(6))
  await wait(1)
  p.push(schedule(7))

  const [x1, x2, x3, x4, x5, x6, x7] = await Promise.all(p)

  expect(x1).toEqual([1, [1, 2, 3, 4]])
  expect(x2).toEqual([2, [1, 2, 3, 4]])
  expect(x3).toEqual([3, [1, 2, 3, 4]])
  expect(x4).toEqual([4, [1, 2, 3, 4]])
  expect(x5).toEqual([5, [5, 6]])
  expect(x6).toEqual([6, [5, 6]])
  expect(x7).toEqual([7, [7]])

  expect(fn).toBeCalledTimes(3)
})

test('args: id', async () => {
  const fn1 = vi.fn()
  const { schedule: schedule1 } = createBatchScheduler({
    id: uid(),
    // biome-ignore lint/complexity/noCommaOperator: _
    fn: async (args: number[]) => (fn1(), args),
  })

  const fn2 = vi.fn()
  const { schedule: schedule2 } = createBatchScheduler({
    id: uid(),
    // biome-ignore lint/complexity/noCommaOperator: _
    fn: async (args: number[]) => (fn2(), args),
  })

  const p = []
  p.push(schedule1(1))
  p.push(schedule2(2))
  p.push(schedule1(3))
  p.push(schedule1(4))
  await wait(1)
  p.push(schedule2(5))
  p.push(schedule1(6))
  p.push(schedule2(7))
  p.push(schedule2(8))
  await wait(1)
  p.push(schedule1(9))

  const [x1, x2, x3, x4, x5, x6, x7, x8, x9] = await Promise.all(p)

  expect(x1).toEqual([1, [1, 3, 4]])
  expect(x2).toEqual([2, [2]])
  expect(x3).toEqual([3, [1, 3, 4]])
  expect(x4).toEqual([4, [1, 3, 4]])
  expect(x5).toEqual([5, [5, 7, 8]])
  expect(x6).toEqual([6, [6]])
  expect(x7).toEqual([7, [5, 7, 8]])
  expect(x8).toEqual([8, [5, 7, 8]])
  expect(x9).toEqual([9, [9]])

  expect(fn1).toBeCalledTimes(3)
  expect(fn2).toBeCalledTimes(2)
})

test('args: wait', async () => {
  const { schedule } = createBatchScheduler({
    id: uid(),
    wait: 10,
    fn: async (args: number[]) => args,
  })

  const p = []
  p.push(schedule(1))
  p.push(schedule(2))
  p.push(schedule(3))
  p.push(schedule(4))
  await wait(1)
  p.push(schedule(5))
  p.push(schedule(6))
  await wait(1)
  p.push(schedule(7))
  await wait(10)
  p.push(schedule(8))
  p.push(schedule(9))
  p.push(schedule(10))

  const [x1, x2, x3, x4, x5, x6, x7, x8, x9, x10] = await Promise.all(p)

  expect(x1).toEqual([1, [1, 2, 3, 4, 5, 6, 7]])
  expect(x2).toEqual([2, [1, 2, 3, 4, 5, 6, 7]])
  expect(x3).toEqual([3, [1, 2, 3, 4, 5, 6, 7]])
  expect(x4).toEqual([4, [1, 2, 3, 4, 5, 6, 7]])
  expect(x5).toEqual([5, [1, 2, 3, 4, 5, 6, 7]])
  expect(x6).toEqual([6, [1, 2, 3, 4, 5, 6, 7]])
  expect(x7).toEqual([7, [1, 2, 3, 4, 5, 6, 7]])
  expect(x8).toEqual([8, [8, 9, 10]])
  expect(x9).toEqual([9, [8, 9, 10]])
  expect(x10).toEqual([10, [8, 9, 10]])
})

test('args: shouldSplitBatch', async () => {
  const fn = vi.fn()
  const { schedule } = createBatchScheduler({
    id: uid(),
    // biome-ignore lint/complexity/noCommaOperator: _
    fn: async (args: number[]) => (fn(), args),
    shouldSplitBatch: (args) => args.length > 3,
  })

  const p = []
  p.push(schedule(1))
  p.push(schedule(2))
  p.push(schedule(3))
  p.push(schedule(4))
  p.push(schedule(5))
  p.push(schedule(6))
  p.push(schedule(7))
  p.push(schedule(8))
  p.push(schedule(9))
  p.push(schedule(10))
  await wait(1)
  p.push(schedule(11))
  p.push(schedule(12))
  await wait(1)
  p.push(schedule(13))

  const [x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13] =
    await Promise.all(p)

  expect(x1).toEqual([1, [1, 2, 3]])
  expect(x2).toEqual([2, [1, 2, 3]])
  expect(x3).toEqual([3, [1, 2, 3]])
  expect(x4).toEqual([4, [4, 5, 6]])
  expect(x5).toEqual([5, [4, 5, 6]])
  expect(x6).toEqual([6, [4, 5, 6]])
  expect(x7).toEqual([7, [7, 8, 9]])
  expect(x8).toEqual([8, [7, 8, 9]])
  expect(x9).toEqual([9, [7, 8, 9]])
  expect(x10).toEqual([10, [10]])
  expect(x11).toEqual([11, [11, 12]])
  expect(x12).toEqual([12, [11, 12]])
  expect(x13).toEqual([13, [13]])

  expect(fn).toBeCalledTimes(6)
})

describe('behavior', () => {
  test('complex args', async () => {
    const { schedule } = createBatchScheduler({
      id: uid(),
      fn: async (args) => args,
    })

    const p = []
    p.push(schedule({ x: 1 }))
    p.push(schedule([1, 2]))
    p.push(schedule({ x: 4, y: [1, 2] }))

    const [x1, x2, x3] = await Promise.all(p)

    expect(x1).toEqual([{ x: 1 }, [{ x: 1 }, [1, 2], { x: 4, y: [1, 2] }]])
    expect(x2).toEqual([
      [1, 2],
      [{ x: 1 }, [1, 2], { x: 4, y: [1, 2] }],
    ])
    expect(x3).toEqual([
      { x: 4, y: [1, 2] },
      [{ x: 1 }, [1, 2], { x: 4, y: [1, 2] }],
    ])
  })

  test('complex split batch', async () => {
    const fn = vi.fn()
    const { schedule } = createBatchScheduler({
      id: uid(),
      wait: 16,
      // biome-ignore lint/complexity/noCommaOperator: _
      fn: async (args: string[]) => (fn(), args),
      shouldSplitBatch: (args) =>
        args.reduce((acc, x) => acc + x.length, 0) > 20,
    })

    const p = []
    p.push(schedule('hello'))
    p.push(schedule('world'))
    p.push(schedule('this is me'))
    p.push(schedule('life should be'))
    p.push(schedule('fun for everyone'))
    await wait(1)
    p.push(schedule('hello world'))
    p.push(schedule('come and see'))
    p.push(schedule('come'))
    p.push(schedule('and'))
    await wait(16)
    p.push(schedule('see'))
    p.push(schedule('smile'))
    p.push(schedule('just be yourself'))
    p.push(schedule('be happy'))

    const [x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11] = await Promise.all(p)

    expect(x1).toEqual(['hello', ['hello', 'world', 'this is me']])
    expect(x2).toEqual(['world', ['hello', 'world', 'this is me']])
    expect(x3).toEqual(['this is me', ['hello', 'world', 'this is me']])
    expect(x4).toEqual(['life should be', ['life should be']])
    expect(x5).toEqual(['fun for everyone', ['fun for everyone']])
    expect(x6).toEqual(['hello world', ['hello world']])
    expect(x7).toEqual(['come and see', ['come and see', 'come', 'and']])
    expect(x8).toEqual(['come', ['come and see', 'come', 'and']])
    expect(x9).toEqual(['and', ['come and see', 'come', 'and']])
    expect(x10).toEqual(['see', ['see', 'smile']])
    expect(x11).toEqual(['smile', ['see', 'smile']])

    expect(fn).toBeCalledTimes(8)
  })

  test('throws error', async () => {
    const { schedule } = createBatchScheduler({
      id: uid(),
      fn: async (args) => {
        throw new Error(JSON.stringify(args))
      },
    })

    await expect(() =>
      Promise.all([schedule(1), schedule(2), schedule(3), schedule(4)]),
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: [1,2,3,4]]')
  })

  test('throws error synchronously', async () => {
    const { schedule } = createBatchScheduler({
      id: uid(),
      fn: (args) => {
        throw new Error(JSON.stringify(args))
      },
    })

    await expect(() =>
      Promise.all([schedule(1), schedule(2), schedule(3), schedule(4)]),
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: [1,2,3,4]]')
  })

  test('premature flush does not cause stale timer to flush next batch', async () => {
    // This test directly reproduces the reported bug: after a premature
    // flush (shouldSplitBatch), the old setTimeout is not cancelled and
    // fires on the next batch, reading the global scheduler.
    //
    // The key to exposing the bug is creating a time gap between the
    // stale timer (T1) and the new batch's timer (T2). We do this by
    // using a long wait and scheduling the new batch item well after
    // the first item, so T1 fires before T2.
    //
    // Timeline with wait=30, shouldSplitBatch=(args.length > 2):
    //   t=0:   schedule(1) → new batch, T1 = setTimeout(exec, 30) → fires at t=30
    //   t=0:   schedule(2) → joins batch [1, 2]
    //   t=0:   schedule(3) → shouldSplitBatch([1,2,3]) → true → exec() flushes [1,2].
    //          Scheduler is now empty. Item 3 starts a new batch.
    //          T2 = setTimeout(exec, 30) → fires at t=30 (since item 3 is also at t≈0)
    //
    // Hmm, T1 and T2 fire at the same time. To separate them, we need
    // item 3 to arrive later. But schedule() is synchronous. Instead,
    // we use shouldSplitBatch at args.length > 1 (split on the 2nd item):
    //
    //   t=0:   schedule(1) → new batch, T1 = setTimeout(exec, 30) → fires at t=30
    //   t=0:   schedule(2) → shouldSplitBatch([1,2]) → true → exec() flushes [1].
    //          Item 2 starts new batch, T2 = setTimeout(exec, 30) → fires at t=30
    // Still same timing. We need to use await wait() between items.
    //
    // Revised approach: schedule first batch, wait a bit, then trigger
    // the split. The stale timer T1 fires at wait_time from item 1.
    // The new batch's timer T2 fires at wait_time from the split point.
    // If the split happens at t=X, T1 fires at t=wait, T2 fires at t=X+wait.
    // When X > 0, T1 fires before T2.
    //
    // With wait=30, shouldSplitBatch=(args.length > 2):
    //   t=0:   schedule(1) → T1 set, fires at t=30
    //   t=0:   schedule(2) → joins batch
    //   t=10:  schedule(3) → split → exec() flushes [1,2]. Item 3 starts
    //          new batch, T2 set, fires at t=40.
    //   t=10:  schedule(4) → joins item 3's batch
    //
    // Without fix: T1 fires at t=30, reads scheduler [3, 4], flushes
    //   them prematurely. T2 fires at t=40, reads empty scheduler.
    //   Result: [3, 4] flushed at t=30 instead of t=40. fn called 2x.
    //   BUT: the batch contents are the same [3, 4]!
    //
    // To make the bug visible in assertions, we need item 4 to arrive
    // AFTER T1 fires but BEFORE T2 fires:
    //   t=0:   schedule(1) → T1 set, fires at t=30
    //   t=0:   schedule(2) → joins batch
    //   t=10:  schedule(3) → split → exec() flushes [1,2]. Item 3 starts
    //          new batch, T2 set, fires at t=40.
    //   t=35:  schedule(4) → joins item 3's batch (if T2 hasn't fired yet)
    //
    // Without fix: T1 fires at t=30, reads scheduler [3], flushes [3]
    //   alone. Item 4 arrives at t=35, starts new batch [4], T3 set.
    //   fn called 3x: [1,2], [3], [4].
    // With fix: T1 cancelled. Item 3's batch [3] waits for T2 at t=40.
    //   Item 4 arrives at t=35, joins [3]. T2 fires at t=40, flushes [3,4].
    //   fn called 2x: [1,2], [3,4].

    const fn = vi.fn()
    const { schedule } = createBatchScheduler({
      id: uid(),
      wait: 30,
      // biome-ignore lint/complexity/noCommaOperator: _
      fn: async (args: number[]) => (fn(), args),
      shouldSplitBatch: (args) => args.length > 2,
    })

    const p = []

    // First batch: items 1, 2. T1 set at t=0, fires at t=30.
    p.push(schedule(1))
    p.push(schedule(2))

    // Wait 10ms so T2 will fire later than T1.
    await wait(10)

    // Item 3 triggers split. exec() flushes [1,2]. Item 3 starts
    // new batch. T2 set at t=10, fires at t=40.
    // Without fix: T1 (set at t=0) still alive, fires at t=30.
    p.push(schedule(3))

    // Wait past T1's fire time (t=30) but before T2's (t=40).
    // At t=35, schedule item 4.
    await wait(25)

    // Without fix: T1 fired at t=30, flushed [3] alone.
    //   Item 4 arrives, starts new batch [4], T3 set.
    // With fix: T1 cancelled. Item 3 still waiting for T2 (fires at t=40).
    //   Item 4 joins item 3's batch → [3, 4].
    p.push(schedule(4))

    // Wait for all timers to settle.
    await wait(30)

    const [x1, x2, x3, x4] = await Promise.all(p)

    expect(x1).toEqual([1, [1, 2]])
    expect(x2).toEqual([2, [1, 2]])

    // With fix: items 3 and 4 are batched together.
    // Without fix: item 3 is flushed alone by stale T1, item 4 alone by T3.
    expect(x3).toEqual([3, [3, 4]])
    expect(x4).toEqual([4, [3, 4]])

    // 2 calls with fix. 3 calls without fix ([1,2], [3], [4]).
    expect(fn).toBeCalledTimes(2)
  })
})
