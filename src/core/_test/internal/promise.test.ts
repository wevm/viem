import { setTimeout } from 'node:timers/promises'
import { Caches } from 'viem'
import { describe, expect, test, vi } from 'vitest'

import * as Http from '../../../../test/src/http.js'
import {
  createBatchScheduler,
  withDedupe,
  withResolvers,
  withRetry,
  withTimeout,
} from '../../internal/promise.js'
import { uid } from '../../internal/uid.js'

describe('createBatchScheduler', () => {
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
    await setTimeout(1)
    p.push(schedule(5))
    p.push(schedule(6))
    await setTimeout(1)
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
    await setTimeout(1)
    p.push(schedule2(5))
    p.push(schedule1(6))
    p.push(schedule2(7))
    p.push(schedule2(8))
    await setTimeout(1)
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
    await setTimeout(1)
    p.push(schedule(5))
    p.push(schedule(6))
    await setTimeout(1)
    p.push(schedule(7))
    await setTimeout(10)
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
    await setTimeout(1)
    p.push(schedule(11))
    p.push(schedule(12))
    await setTimeout(1)
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
      await setTimeout(1)
      p.push(schedule('hello world'))
      p.push(schedule('come and see'))
      p.push(schedule('come'))
      p.push(schedule('and'))
      await setTimeout(16)
      p.push(schedule('see'))
      p.push(schedule('smile'))
      p.push(schedule('just be yourself'))
      p.push(schedule('be happy'))

      const [x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11] =
        await Promise.all(p)

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
})

describe('withDedupe', () => {
  test('default', async () => {
    let count = 0
    async function fn() {
      count++
      await setTimeout(100)
      return 'bar'
    }

    const id = 'foo'

    const promise_1 = withDedupe(fn, { id })
    const promise_2 = withDedupe(fn, { id })
    expect(promise_1).toBe(promise_2)
    expect(Caches.dedupe.has(id)).toBe(true)

    const results = await Promise.all([promise_1, promise_2])
    expect(results[0]).toBe(results[1])
    expect(count).toBe(1)
    expect(Caches.dedupe.has(id)).toBe(false)
  })

  test('args: enabled', async () => {
    let count = 0
    async function fn() {
      count++
      await setTimeout(100)
      return 'bar'
    }

    const id = 'foo'

    const promise_1 = withDedupe(fn, { id })
    const promise_2 = withDedupe(fn, { id, enabled: false })
    const promise_3 = withDedupe(fn, { id })
    expect(promise_1).not.toBe(promise_2)
    expect(promise_1).toBe(promise_3)
    expect(Caches.dedupe.has(id)).toBe(true)

    const results = await Promise.all([promise_1, promise_2, promise_3])
    expect(results[0]).toBe(results[1])
    expect(count).toBe(2)
    expect(Caches.dedupe.has(id)).toBe(false)
  })

  test('args: undefined id', async () => {
    let count = 0
    async function fn() {
      count++
      await setTimeout(100)
      return 'bar'
    }

    const id = 'foo'

    const promise_1 = withDedupe(fn, { id })
    const promise_2 = withDedupe(fn, { id: undefined })
    const promise_3 = withDedupe(fn, { id })
    expect(promise_1).not.toBe(promise_2)
    expect(promise_1).toBe(promise_3)
    expect(Caches.dedupe.has(id)).toBe(true)

    const results = await Promise.all([promise_1, promise_2, promise_3])
    expect(results[0]).toBe(results[1])
    expect(count).toBe(2)
    expect(Caches.dedupe.has(id)).toBe(false)
  })

  test('behavior: errors', async () => {
    let count = 0
    async function fn() {
      count++
      await setTimeout(100)
      throw new Error('rekt')
    }

    const id = 'foo'

    const promise_1 = withDedupe(fn, { id })
    const promise_2 = withDedupe(fn, { id })
    expect(Caches.dedupe.has(id)).toBe(true)

    await expect(() =>
      Promise.all([promise_1, promise_2]),
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: rekt]')
    expect(count).toBe(1)
    expect(Caches.dedupe.has(id)).toBe(false)
  })
})

describe('withResolvers', () => {
  test('default', () => {
    {
      const { promise, resolve } = withResolvers<number>()
      resolve(1)
      expect(promise).resolves.toBe(1)
    }

    {
      const { promise, reject } = withResolvers<number>()
      reject(new Error('test'))
      expect(promise).rejects.toThrow('test')
    }
  })
})

describe('withRetry', () => {
  test('default', async () => {
    let retryTimes = -1
    const server = await Http.createServer((_req, res) => {
      retryTimes++
      res.writeHead(500)
      res.end()
    })

    await expect(
      withRetry(async () => {
        const response = await fetch(server.url)
        if (response.status === 500) throw new Error('test')
        return response
      }),
    ).rejects.toThrowError('test')
    expect(retryTimes).toBe(2)
  })

  test('shouldRetry: retries, and then errors', async () => {
    let retryTimes = -1
    const server = await Http.createServer((_req, res) => {
      retryTimes++
      res.writeHead(500)
      res.end()
    })

    await expect(
      withRetry(
        async () => {
          const response = await fetch(server.url)
          if (response.status === 500) throw new Error('test')
          return response
        },
        { shouldRetry: ({ error }) => error.message === 'test' },
      ),
    ).rejects.toThrowError('test')
    expect(retryTimes).toBe(2)
  })

  test('shouldRetry: retries, and then succeeds', async () => {
    let retryTimes = -1
    const server = await Http.createServer((_req, res) => {
      retryTimes++
      if (retryTimes === 2) {
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ message: 'success' }))
      } else {
        res.writeHead(500)
        res.end()
      }
    })

    const res = await withRetry(
      async () => {
        const response = await fetch(server.url)
        if (response.status === 500) throw new Error('test')
        return (await response).json()
      },
      {
        retryCount: 3,
        shouldRetry: ({ error }) => error.message === 'test',
      },
    )
    expect(res).toEqual({ message: 'success' })
    expect(retryTimes).toBe(2)
  })

  test('retryCount', async () => {
    let retryTimes = -1
    const server = await Http.createServer((_req, res) => {
      retryTimes++
      res.writeHead(500)
      res.end()
    })

    await expect(
      withRetry(
        async () => {
          const response = await fetch(server.url)
          if (response.status === 500) throw new Error('test')
          return response
        },
        { retryCount: 1 },
      ),
    ).rejects.toThrowError('test')
    expect(retryTimes).toBe(1)
  })

  test('delay: number', async () => {
    const start = Date.now()
    let end = 0
    const server = await Http.createServer((_req, res) => {
      end = Date.now() - start
      res.writeHead(500)
      res.end()
    })

    await expect(
      withRetry(
        async () => {
          const response = await fetch(server.url)
          if (response.status === 500) throw new Error('test')
          return response
        },
        { retryCount: 1, delay: 500 },
      ),
    ).rejects.toThrowError('test')
    expect(end > 500 && end < 520).toBe(true)
  })

  test('delay: fn', async () => {
    const start = Date.now()
    let end = 0
    const server = await Http.createServer((_req, res) => {
      end = Date.now() - start
      res.writeHead(500, {
        'Retry-After': 1,
      })
      res.end()
    })

    await expect(
      withRetry(
        async () => {
          const response = await fetch(server.url)
          class TestError extends Error {
            headers: Headers
            constructor(headers: Headers) {
              super('test')
              this.headers = headers
            }
          }
          if (response.status === 500) throw new TestError(response.headers)
          return response
        },
        {
          retryCount: 1,
          delay: ({ error }) => {
            const retryAfter = (error as any).headers.get('Retry-After')
            if (retryAfter?.match(/\d/))
              return Number.parseInt(retryAfter) * 1000
            return 100
          },
        },
      ),
    ).rejects.toThrowError('test')
    expect(end > 1000 && end < 1020).toBe(true)
  })
})

describe('withTimeout', () => {
  test('times out correctly', async () => {
    await expect(() =>
      withTimeout(
        async () => {
          await setTimeout(2000)
        },
        { errorInstance: new Error('timed out'), timeout: 500 },
      ),
    ).rejects.toThrowError('timed out')
  })

  test('times out correctly w/ signal', async () => {
    const server = await Http.createServer((_req, res) =>
      setTimeout(5000, () => res.end('wagmi')),
    )

    await expect(() =>
      withTimeout(
        async ({ signal }) => {
          await fetch(server.url, { signal })
        },
        {
          errorInstance: new Error('timed out'),
          timeout: 500,
          signal: true,
        },
      ),
    ).rejects.toThrowError('timed out')

    server.close()
  })
})
