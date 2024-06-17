import { expect, test } from 'vitest'

import { wait } from '../wait.js'

import { promiseCache, withDedupe } from './withDedupe.js'

test('default', async () => {
  let count = 0
  async function fn() {
    count++
    await wait(100)
    return 'bar'
  }

  const id = 'foo'

  const promise_1 = withDedupe(fn, { id })
  const promise_2 = withDedupe(fn, { id })
  expect(promise_1).toBe(promise_2)
  expect(promiseCache.has(id)).toBe(true)

  const results = await Promise.all([promise_1, promise_2])
  expect(results[0]).toBe(results[1])
  expect(count).toBe(1)
  expect(promiseCache.has(id)).toBe(false)
})

test('args: enabled', async () => {
  let count = 0
  async function fn() {
    count++
    await wait(100)
    return 'bar'
  }

  const id = 'foo'

  const promise_1 = withDedupe(fn, { id })
  const promise_2 = withDedupe(fn, { id, enabled: false })
  const promise_3 = withDedupe(fn, { id })
  expect(promise_1).not.toBe(promise_2)
  expect(promise_1).toBe(promise_3)
  expect(promiseCache.has(id)).toBe(true)

  const results = await Promise.all([promise_1, promise_2, promise_3])
  expect(results[0]).toBe(results[1])
  expect(count).toBe(2)
  expect(promiseCache.has(id)).toBe(false)
})

test('args: undefined id', async () => {
  let count = 0
  async function fn() {
    count++
    await wait(100)
    return 'bar'
  }

  const id = 'foo'

  const promise_1 = withDedupe(fn, { id })
  const promise_2 = withDedupe(fn, { id: undefined })
  const promise_3 = withDedupe(fn, { id })
  expect(promise_1).not.toBe(promise_2)
  expect(promise_1).toBe(promise_3)
  expect(promiseCache.has(id)).toBe(true)

  const results = await Promise.all([promise_1, promise_2, promise_3])
  expect(results[0]).toBe(results[1])
  expect(count).toBe(2)
  expect(promiseCache.has(id)).toBe(false)
})

test('behavior: errors', async () => {
  let count = 0
  async function fn() {
    count++
    await wait(100)
    throw new Error('rekt')
  }

  const id = 'foo'

  const promise_1 = withDedupe(fn, { id })
  const promise_2 = withDedupe(fn, { id })
  expect(promiseCache.has(id)).toBe(true)

  await expect(() =>
    Promise.all([promise_1, promise_2]),
  ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: rekt]')
  expect(count).toBe(1)
  expect(promiseCache.has(id)).toBe(false)
})
