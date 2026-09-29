import { expect, test } from 'vitest'
import { timestampMsThreshold } from '../constants.js'
import { normalizeTimestampMs } from './normalizeTimestampMs.js'

test('keeps 0 and millisecond bounds; scales second bounds', () => {
  expect(normalizeTimestampMs(0n)).toBe(0n)
  expect(normalizeTimestampMs(1_790_704_368n)).toBe(1_790_704_368_000n)
  expect(normalizeTimestampMs(1_790_704_368_000n)).toBe(1_790_704_368_000n)
  expect(normalizeTimestampMs(timestampMsThreshold - 1n)).toBe(
    (timestampMsThreshold - 1n) * 1000n,
  )
  expect(normalizeTimestampMs(timestampMsThreshold)).toBe(timestampMsThreshold)
})
