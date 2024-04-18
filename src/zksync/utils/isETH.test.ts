import { expect, test } from 'vitest'
import { isETH } from './isETH.js'

test('true', () => {
  expect(isETH('0x0000000000000000000000000000000000000000')).toBeTruthy()
  expect(isETH('0x000000000000000000000000000000000000800a')).toBeTruthy()
  expect(isETH('0x0000000000000000000000000000000000000001')).toBeTruthy()
})

test('false', () => {
  expect(isETH('0x0000000000000000000000000000000000000002')).toBeFalsy()
  expect(isETH('0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f')).toBeFalsy()
})
