import { expect, test } from 'vitest'

import * as Hardfork from './Hardfork.js'

test('lt', () => {
  expect(Hardfork.lt('genesis', 't0')).toBe(true)
  expect(Hardfork.lt('t1', 't3')).toBe(true)
  expect(Hardfork.lt('t1a', 't1b')).toBe(true)
  expect(Hardfork.lt('t3', 't3')).toBe(false)
  expect(Hardfork.lt('t6', 't0')).toBe(false)
})

test('lt: unknown hardfork is before everything', () => {
  expect(Hardfork.lt('unknown', 'genesis')).toBe(true)
  expect(Hardfork.lt('unknown', 't6')).toBe(true)
})

test('hardforks are unique', () => {
  expect(new Set(Hardfork.hardforks).size).toBe(Hardfork.hardforks.length)
})
