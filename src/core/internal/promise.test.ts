import { beforeEach, describe, expect, test, vi } from 'vp/test'

import {
  createBatchScheduler,
  getCache,
  withCache,
  withDedupe,
  withResolvers,
  withRetry,
  withTimeout,
} from './promise.js'

beforeEach(() => {
  getCache('foo').clear()
  getCache('bar').clear()
})

describe('getCache', () => {
  test('behavior: clears promise and response stores independently', () => {
    const cache = getCache<string>('foo')
    cache.promise.set(Promise.resolve('bar'))
    cache.response.set({ created: new Date(), data: 'bar' })

    cache.promise.clear()
    cache.response.clear()

    expect({
      promise: cache.promise.get(),
      response: cache.response.get(),
    }).toMatchInlineSnapshot(`
      {
        "promise": undefined,
        "response": undefined,
      }
    `)
  })

  test('behavior: clears promise and response entries', () => {
    const cache = getCache<string>('foo')
    cache.promise.set(Promise.resolve('bar'))
    cache.response.set({ created: new Date(), data: 'bar' })
    cache.clear()

    expect({
      promise: cache.promise.get(),
      response: cache.response.get(),
    }).toMatchInlineSnapshot(`
      {
        "promise": undefined,
        "response": undefined,
      }
    `)
  })
})

describe('withCache', () => {
  test('behavior: caches responses', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    const first = await withCache(fn, { cacheKey: 'foo' })
    const second = await withCache(fn, { cacheKey: 'foo' })

    expect({ first, second }).toMatchInlineSnapshot(`
      {
        "first": "bar",
        "second": "bar",
      }
    `)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('behavior: invalidates expired responses', async () => {
    const fn = vi.fn().mockResolvedValue('baz')
    getCache<string>('foo').response.set({
      created: new Date(Date.now() - 200),
      data: 'bar',
    })

    const data = await withCache(fn, { cacheKey: 'foo', cacheTime: 100 })

    expect(data).toMatchInlineSnapshot(`"baz"`)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('behavior: dedupes in-flight promises', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        withCache(() => fn(), { cacheKey: 'foo' }),
      ),
    )

    expect(results).toMatchInlineSnapshot(`
      [
        "bar",
        "bar",
        "bar",
        "bar",
        "bar",
        "bar",
        "bar",
        "bar",
        "bar",
        "bar",
      ]
    `)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('behavior: separates cache keys', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    await Promise.all([
      withCache(() => fn(), { cacheKey: 'foo' }),
      withCache(() => fn(), { cacheKey: 'bar' }),
    ])

    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('withDedupe', () => {
  test('behavior: dedupes in-flight promises by id', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    const results = await Promise.all([
      withDedupe(() => fn(), { id: 'dedupe:1' }),
      withDedupe(() => fn(), { id: 'dedupe:1' }),
      withDedupe(() => fn(), { id: 'dedupe:1' }),
    ])

    expect({
      calls: fn.mock.calls.length,
      results,
    }).toMatchInlineSnapshot(`
      {
        "calls": 1,
        "results": [
          "bar",
          "bar",
          "bar",
        ],
      }
    `)
  })

  test('behavior: skips dedupe when disabled', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    await Promise.all([
      withDedupe(() => fn(), { enabled: false, id: 'dedupe:2' }),
      withDedupe(() => fn(), { enabled: false, id: 'dedupe:2' }),
    ])

    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('withRetry', () => {
  test('behavior: retries until success', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('retry'))
      .mockResolvedValue('bar')

    const result = await withRetry(() => fn(), { delay: 0, retryCount: 1 })

    expect({
      calls: fn.mock.calls.length,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": 2,
        "result": "bar",
      }
    `)
  })

  test('behavior: respects shouldRetry', async () => {
    const error = new Error('nope')
    const fn = vi.fn().mockRejectedValue(error)

    await expect(() =>
      withRetry(() => fn(), {
        delay: 0,
        retryCount: 3,
        shouldRetry: () => false,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: nope]`)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('behavior: rejects with abort reason', async () => {
    const controller = new AbortController()
    controller.abort(new Error('aborted'))

    await expect(() =>
      withRetry(() => Promise.resolve('bar'), { signal: controller.signal }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: aborted]`)
  })
})

describe('withTimeout', () => {
  test('behavior: resolves before timeout', async () => {
    const result = await withTimeout(async () => 'bar', { timeout: 1 })

    expect(result).toMatchInlineSnapshot(`"bar"`)
  })

  test('behavior: rejects after timeout', async () => {
    await expect(() =>
      withTimeout(() => new Promise(() => undefined), {
        errorInstance: new Error('slow'),
        timeout: 1,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: slow]`)
  })

  test('behavior: aborts the inner operation on timeout', async () => {
    await expect(() =>
      withTimeout(
        ({ signal }) =>
          new Promise((_resolve, reject) => {
            signal?.addEventListener('abort', () => {
              const error = new Error('aborted')
              error.name = 'AbortError'
              reject(error)
            })
          }),
        {
          errorInstance: new Error('slow'),
          signal: true,
          timeout: 1,
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: slow]`)
  })
})

describe('withResolvers', () => {
  test('behavior: exposes resolve and reject callbacks', async () => {
    const resolved = withResolvers<string>()
    resolved.resolve('bar')

    const rejected = withResolvers<string>()
    rejected.reject(new Error('foo'))

    await expect(rejected.promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: foo]`,
    )
    await expect(resolved.promise).resolves.toMatchInlineSnapshot(`"bar"`)
  })
})

describe('createBatchScheduler', () => {
  test('behavior: batches scheduled calls', async () => {
    const fn = vi.fn(async (args: number[]) => args.map((value) => value * 10))
    const scheduler = createBatchScheduler({
      fn,
      id: 'batch:1',
    })

    const results = await Promise.all([
      scheduler.schedule(1),
      scheduler.schedule(2),
    ])

    expect({
      calls: fn.mock.calls,
      results,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          [
            [
              1,
              2,
            ],
          ],
        ],
        "results": [
          [
            10,
            [
              10,
              20,
            ],
          ],
          [
            20,
            [
              10,
              20,
            ],
          ],
        ],
      }
    `)
  })

  test('behavior: flushes when a batch should split', async () => {
    const fn = vi.fn(async (args: number[]) => args)
    const scheduler = createBatchScheduler({
      fn,
      id: 'batch:2',
      shouldSplitBatch: (args) => args.length > 2,
    })

    const results = await Promise.all([
      scheduler.schedule(1),
      scheduler.schedule(2),
      scheduler.schedule(3),
    ])

    expect({
      calls: fn.mock.calls,
      results,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          [
            [
              1,
              2,
            ],
          ],
          [
            [
              3,
            ],
          ],
        ],
        "results": [
          [
            1,
            [
              1,
              2,
            ],
          ],
          [
            2,
            [
              1,
              2,
            ],
          ],
          [
            3,
            [
              3,
            ],
          ],
        ],
      }
    `)
  })
})
