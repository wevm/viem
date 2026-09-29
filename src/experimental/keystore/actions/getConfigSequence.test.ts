import { expect, test } from 'vitest'
import { unsequencedLocalHalf } from '../constants.js'
import { unsequencedLocalSequence } from './getConfigSequence.js'

test('unsequencedLocalHalf is type(uint32).max', () => {
  expect(unsequencedLocalHalf).toBe(2n ** 32n - 1n)
  expect(unsequencedLocalHalf).toBe(0xffff_ffffn)
})

test('unsequencedLocalSequence packs epoch (high 32) || UNSEQUENCED (low 32)', () => {
  // epoch 0 → just the sentinel in the low half.
  expect(unsequencedLocalSequence(0)).toBe(0xffff_ffffn)
  // epoch 1 → 0x1_ffff_ffff.
  expect(unsequencedLocalSequence(1)).toBe((1n << 32n) | 0xffff_ffffn)

  // For an arbitrary epoch: high 32 bits are the epoch, low 32 the sentinel.
  const epoch = 42
  const word = unsequencedLocalSequence(epoch)
  expect(word >> 32n).toBe(BigInt(epoch))
  expect(word & 0xffff_ffffn).toBe(unsequencedLocalHalf)
})
