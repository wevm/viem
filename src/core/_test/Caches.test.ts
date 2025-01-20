import { Caches } from 'viem'
import { expect, test } from 'vitest'

test('exports', () => {
  expect(Object.keys(Caches)).toMatchInlineSnapshot(`
    [
      "dedupe",
      "scheduler",
      "clear",
    ]
  `)
})

test('default', () => {
  Caches.dedupe.set('a', Promise.resolve('foo'))
  Caches.dedupe.set('b', Promise.resolve('bar'))

  expect(Caches.dedupe.size).toBe(2)
  Caches.clear()
  expect(Caches.dedupe.size).toBe(0)
})
