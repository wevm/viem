import { expect, test } from 'vitest'
import { isEth } from './isEth.js'

test('true', () => {
  expect(isEth('0x0000000000000000000000000000000000000000')).toBeTruthy()
  expect(isEth('0x000000000000000000000000000000000000800a')).toBeTruthy()
  expect(isEth('0x0000000000000000000000000000000000000001')).toBeTruthy()
})

test('false', () => {
  expect(isEth('0x0000000000000000000000000000000000000002')).toBeFalsy()
  expect(isEth('0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f')).toBeFalsy()
})
