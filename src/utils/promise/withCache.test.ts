import { beforeEach, describe, expect, test, vi } from 'vitest'

import { wait } from '../wait.js'

import { getCache, responseCache, withCache } from './withCache.js'

beforeEach(() => getCache('foo').clear())

test('caches responses', async () => {
  const fn = vi.fn().mockResolvedValue('bar')

  let data = await withCache(fn, { cacheKey: 'foo' })
  expect(data).toBe('bar')

  data = await withCache(fn, { cacheKey: 'foo' })
  expect(data).toBe('bar')

  expect(fn).toBeCalledTimes(1)
})

describe('args: cacheTime', () => {
  test('invalidates when cacheTime = 0', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    let data = await withCache(fn, { cacheKey: 'foo' })
    expect(data).toBe('bar')
    data = await withCache(fn, { cacheKey: 'foo', cacheTime: 0 })
    expect(data).toBe('bar')
    expect(fn).toBeCalledTimes(2)
  })

  test('invalidates when expired', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    let data = await withCache(fn, { cacheKey: 'foo' })
    expect(data).toBe('bar')
    data = await withCache(fn, { cacheKey: 'foo' })
    expect(data).toBe('bar')
    expect(fn).toBeCalledTimes(1)

    await wait(150)
    data = await withCache(fn, { cacheKey: 'foo', cacheTime: 100 })
    expect(data).toBe('bar')
    expect(fn).toBeCalledTimes(2)
  })
})

describe('args: cacheKey', () => {
  test('different cacheKeys', async () => {
    const fn = vi.fn().mockResolvedValue('bar')

    let data = await withCache(fn, { cacheKey: 'foo' })
    expect(data).toBe('bar')
    data = await withCache(fn, { cacheKey: 'baz' })
    expect(data).toBe('bar')
    expect(fn).toBeCalledTimes(2)
  })
})

describe('behavior: caches promises (deduping)', () => {
  test('basic', async () => {
    const fn = vi.fn()
    await Promise.all(
      Array.from({ length: 10 }, () =>
        withCache(async () => fn(), { cacheKey: 'foo' }),
      ),
    )
    expect(fn).toBeCalledTimes(1)
  })

  test('different cacheKeys', async () => {
    const fn = vi.fn().mockResolvedValue('bar')
    await Promise.all([
      ...Array.from({ length: 10 }, () =>
        withCache(() => fn(), { cacheKey: 'foo' }),
      ),
      ...Array.from({ length: 10 }, () =>
        withCache(() => fn(), { cacheKey: 'bar' }),
      ),
    ])
    expect(fn).toBeCalledTimes(2)
  })
})

test('behavior: programmatic removal', async () => {
  const fn = vi.fn().mockResolvedValue('bar')

  let data = await withCache(fn, { cacheKey: 'foo' })
  expect(data).toBe('bar')

  getCache('foo').clear()

  data = await withCache(fn, { cacheKey: 'foo' })
  expect(data).toBe('bar')

  expect(fn).toBeCalledTimes(2)
})

test('does not cache a pending response after the cache is cleared', async () => {
  let resolve!: (value: string) => void
  const pending = withCache(
    () => new Promise<string>((resolve_) => (resolve = resolve_)),
    { cacheKey: 'foo' },
  )

  getCache('foo').clear()
  resolve('old')

  expect(await pending).toMatchInlineSnapshot('"old"')
  expect(getCache<string>('foo').response.get()?.data).toMatchInlineSnapshot(
    'undefined',
  )
})

test('keeps a newer response when a cleared request resolves later', async () => {
  let resolve!: (value: string) => void
  const pending = withCache(
    () => new Promise<string>((resolve_) => (resolve = resolve_)),
    { cacheKey: 'foo' },
  )

  getCache('foo').clear()
  await withCache(async () => 'new', { cacheKey: 'foo' })
  resolve('old')
  await pending

  const cached = await withCache(async () => 'unused', { cacheKey: 'foo' })

  expect(cached).toMatchInlineSnapshot('"new"')
})

test('keeps a newer pending request when a cleared request resolves', async () => {
  let resolveOld!: (value: string) => void
  let resolveNew!: (value: string) => void
  const old = withCache(
    () => new Promise<string>((resolve) => (resolveOld = resolve)),
    { cacheKey: 'foo' },
  )

  getCache('foo').clear()
  const pending = withCache(
    () => new Promise<string>((resolve) => (resolveNew = resolve)),
    { cacheKey: 'foo' },
  )
  resolveOld('old')
  await old
  const shared = withCache(async () => 'unused', { cacheKey: 'foo' })
  resolveNew('new')

  expect(await Promise.all([pending, shared])).toMatchInlineSnapshot(`
    [
      "new",
      "new",
    ]
  `)
})

test('behavior: keeps at most 8192 responses', async () => {
  for (let i = 0; i < 8200; i++)
    await withCache(async () => i, { cacheKey: `bounded.${i}` })

  expect(responseCache.size).toMatchInlineSnapshot('8192')
  expect(responseCache.has('bounded.0')).toMatchInlineSnapshot('false')
  expect(responseCache.has('bounded.8199')).toMatchInlineSnapshot('true')
})
