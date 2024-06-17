import { expect, test } from 'vitest'

import { wait } from '../wait.js'

import { promiseCache, withDedupe } from './withDedupe.js'

test('default', async () => {
  let count = 0
  async function fn() {
    count++
    await wait(1000)
    return 'bar'
  }

  const id = 'foo'

  const promise_1 = withDedupe(fn, { id })
  const promise_2 = withDedupe(fn, { id })
  expect(promiseCache.has(id)).toBe(true)

  const results = await Promise.all([promise_1, promise_2])
  expect(results[0]).toBe(results[1])
  expect(count).toBe(1)
  expect(promiseCache.has(id)).toBe(false)
})
