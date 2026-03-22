import { describe, expect, test } from 'vitest'

import { uid } from './uid.js'

describe('uid', () => {
  test('returns a string of default length (11)', () => {
    const id = uid()
    expect(typeof id).toBe('string')
    expect(id).toHaveLength(11)
  })

  test('returns a string of custom length', () => {
    expect(uid(5)).toHaveLength(5)
    expect(uid(20)).toHaveLength(20)
    expect(uid(1)).toHaveLength(1)
  })

  test('returns unique values across multiple calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()))
    expect(ids.size).toBe(100)
  })

  test('refills buffer when exhausted', () => {
    // The internal buffer is 512 chars (256 * 2 hex chars).
    // Requesting a length that forces repeated refills still produces
    // valid strings of the correct length.
    const results: string[] = []
    for (let i = 0; i < 60; i++) {
      results.push(uid(11))
    }
    // After 60 calls the index exceeds 512, so the buffer must refill.
    const afterRefill = uid(11)
    expect(afterRefill).toHaveLength(11)
    expect(typeof afterRefill).toBe('string')
  })
})
