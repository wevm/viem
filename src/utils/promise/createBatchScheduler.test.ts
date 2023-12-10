import { describe, expect, test, vi } from 'vitest'

import { uid } from '../uid.js'
import { wait } from '../wait.js'

import { createBatchScheduler } from './createBatchScheduler.js'

test('default', async () => {
  const fn = vi.fn()
  const { schedule } = createBatchScheduler({
    id: uid(),
    // biome-ignore lint/style/noCommaOperator:
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
    // biome-ignore lint/style/noCommaOperator:
    fn: async (args: number[]) => (fn1(), args),
  })

  const fn2 = vi.fn()
  const { schedule: schedule2 } = createBatchScheduler({
    id: uid(),
    // biome-ignore lint/style/noCommaOperator:
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
    // biome-ignore lint/style/noCommaOperator:
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
      // biome-ignore lint/style/noCommaOperator:
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
})
