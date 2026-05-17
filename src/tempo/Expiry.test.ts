import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import * as Expiry from './Expiry.js'

const fixedNow = new Date('2025-06-15T12:00:00.000Z').getTime()
const fixedUnix = Math.floor(fixedNow / 1000)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(fixedNow)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('seconds', () => {
  test('returns unix timestamp n seconds from now', () => {
    expect(Expiry.seconds(30)).toBe(fixedUnix + 30)
  })

  test('0 returns current time', () => {
    expect(Expiry.seconds(0)).toBe(fixedUnix)
  })
})

describe('minutes', () => {
  test('returns unix timestamp n minutes from now', () => {
    expect(Expiry.minutes(5)).toBe(fixedUnix + 300)
  })
})

describe('hours', () => {
  test('returns unix timestamp n hours from now', () => {
    expect(Expiry.hours(2)).toBe(fixedUnix + 7200)
  })
})

describe('days', () => {
  test('returns unix timestamp n days from now', () => {
    expect(Expiry.days(1)).toBe(fixedUnix + 86400)
  })
})

describe('weeks', () => {
  test('returns unix timestamp n weeks from now', () => {
    expect(Expiry.weeks(1)).toBe(fixedUnix + 604800)
  })
})

describe('months', () => {
  test('returns unix timestamp n months (30 days) from now', () => {
    expect(Expiry.months(1)).toBe(fixedUnix + 2592000)
  })
})

describe('years', () => {
  test('returns unix timestamp n years (365 days) from now', () => {
    expect(Expiry.years(1)).toBe(fixedUnix + 31536000)
  })
})
