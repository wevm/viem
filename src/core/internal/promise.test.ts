import { beforeEach, describe, expect, test, vi } from 'vp/test'

import { getCache, withCache } from './promise.js'

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
