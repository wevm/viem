import { expect, test } from 'vitest'

import * as Expiry from './Expiry.js'

/** Asserts `value` is `offset` seconds from now (±1s of clock drift). */
function expectOffset(value: number, offset: number) {
  const now = Math.floor(Date.now() / 1000)
  expect(value - now).toBeGreaterThanOrEqual(offset - 1)
  expect(value - now).toBeLessThanOrEqual(offset + 1)
}

test('seconds', () => {
  expectOffset(Expiry.seconds(30), 30)
  expectOffset(Expiry.seconds(0), 0)
})

test('minutes', () => {
  expectOffset(Expiry.minutes(5), 5 * 60)
})

test('hours', () => {
  expectOffset(Expiry.hours(2), 2 * 60 * 60)
})

test('days', () => {
  expectOffset(Expiry.days(3), 3 * 24 * 60 * 60)
})

test('weeks', () => {
  expectOffset(Expiry.weeks(2), 2 * 7 * 24 * 60 * 60)
})

test('months', () => {
  expectOffset(Expiry.months(1), 30 * 24 * 60 * 60)
})

test('years', () => {
  expectOffset(Expiry.years(1), 365 * 24 * 60 * 60)
})
