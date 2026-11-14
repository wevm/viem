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

test('checks the checksum of mixed-case addresses', () => {
  expect(isAddress('0x787bc77F1700DCE0f8c1581c18A12d3153D1B150')).toBe(true)
  expect(isAddress('0x787bc77F1700DCE0f8c1581c18A12d3153D1b150')).toBe(false)
  expect(isAddress('0x787bc77f1700dce0f8c1581c18a12d3153d1b150')).toBe(true)
  expect(isAddress('0x787BC77F1700DCE0F8C1581C18A12D3153D1B150')).toBe(false)
  expect(
    isAddress('0x787bc77F1700DCE0f8c1581c18A12d3153D1b150', { strict: false }),
  ).toBe(true)
})
