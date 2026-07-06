import { expect, test } from 'vitest'

import * as Concurrent from './concurrent.js'

test('single request returns false', async () => {
  const result = await Concurrent.detect('0xsingle')
  expect(result).toBe(false)
})

test('concurrent requests return true', async () => {
  const results = await Promise.all([
    Concurrent.detect('0xconcurrent'),
    Concurrent.detect('0xconcurrent'),
  ])
  expect(results[0]).toBe(true)
  expect(results[1]).toBe(true)
})

test('3+ concurrent requests all return true', async () => {
  const results = await Promise.all([
    Concurrent.detect('0xtriple'),
    Concurrent.detect('0xtriple'),
    Concurrent.detect('0xtriple'),
  ])
  expect(results[0]).toBe(true)
  expect(results[1]).toBe(true)
  expect(results[2]).toBe(true)
})

test('sequential requests return false', async () => {
  expect(await Concurrent.detect('0xsequential')).toBe(false)
  expect(await Concurrent.detect('0xsequential')).toBe(false)
})

test('different keys do not interfere', async () => {
  const results = await Promise.all([
    Concurrent.detect('0xkey-a'),
    Concurrent.detect('0xkey-b'),
  ])
  expect(results[0]).toBe(false)
  expect(results[1]).toBe(false)
})
