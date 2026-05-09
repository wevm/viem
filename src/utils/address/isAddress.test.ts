import { expect, test } from 'vitest'

import { isAddress } from './isAddress.js'

test('checks if address is valid', () => {
  expect(isAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBeFalsy()
  expect(isAddress('x')).toBeFalsy()
  expect(isAddress('0xa')).toBeFalsy()
  expect(isAddress('0xa0cf798816d4b9b9866b5330eea46a18382f251e')).toBeTruthy()
  expect(isAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az')).toBeFalsy()
  expect(isAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff')).toBeFalsy()
  expect(isAddress('a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBeFalsy()
})
