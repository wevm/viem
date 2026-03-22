import { expect, test } from 'vitest'

import { uid } from './uid.js'

test('uid: returns a string of default length (11)', () => {
  const id = uid()
  expect(typeof id).toBe('string')
  expect(id).toHaveLength(11)
})

test('uid: returns a string of custom length', () => {
  expect(uid(5)).toHaveLength(5)
  expect(uid(20)).toHaveLength(20)
  expect(uid(1)).toHaveLength(1)
})

test('uid: returns unique values across multiple calls', () => {
  const ids = new Set(Array.from({ length: 100 }, () => uid()))
  expect(ids.size).toBe(100)
})

test('uid: refills buffer when exhausted', () => {
  // The internal buffer is 512 hex chars. The index increments by 1
  // per call, and refill triggers when index + length > 512.
  // With length=11, that means refill after 502 calls.
  const results: string[] = []
  for (let i = 0; i < 510; i++) {
    results.push(uid(11))
  }
  const afterRefill = uid(11)
  expect(afterRefill).toHaveLength(11)
  expect(typeof afterRefill).toBe('string')
})
