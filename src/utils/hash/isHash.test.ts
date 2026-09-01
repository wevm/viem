import { expect, test } from 'vitest'

import { isHash } from './isHash.js'

test('checks if hash is valid', () => {
  expect(isHash('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBeFalsy()
  expect(isHash('0xa0cf798816d4b9b9866b5330eea46a18382f251e')).toBeFalsy()
  expect(isHash('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az')).toBeFalsy()
  expect(isHash('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff')).toBeFalsy()
  expect(isHash('a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBeFalsy()
  expect(
    isHash(
      '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    ),
  ).toBeTruthy()
  expect(
    isHash(
      '0x60FDD29FF912CE880CD3EDAF9F932DC61D3DAE823EA77E0323F94ADB9F6A72FE',
    ),
  ).toBeTruthy()
})

test('checks length is exactly 32 bytes', () => {
  expect(isHash('')).toBeFalsy()
  expect(isHash('0x')).toBeFalsy()
  // 31.5 bytes: `size` rounds odd-length hex up to 32, so this used to pass.
  expect(isHash(`0x${'a'.repeat(63)}`)).toBeFalsy()
  expect(isHash(`0x${'a'.repeat(64)}`)).toBeTruthy()
  expect(isHash(`0x${'a'.repeat(65)}`)).toBeFalsy()
  expect(isHash(`0x${'a'.repeat(66)}`)).toBeFalsy()
  // 66 chars, but not hex.
  expect(isHash(`0x${'z'.repeat(64)}`)).toBeFalsy()
})
