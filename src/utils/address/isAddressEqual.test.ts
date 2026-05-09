import { describe, expect, test } from 'vitest'

import { isAddressEqual } from './isAddressEqual.js'

test('checksums address', () => {
  expect(
    isAddressEqual(
      '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    ),
  ).toBeTruthy()
  expect(
    isAddressEqual(
      '0xa0cf798816d4b9b9866b5330eea46a18382f251e',
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    ),
  ).toBeTruthy()
  expect(
    isAddressEqual(
      '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
      '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
    ),
  ).toBeTruthy()
  expect(
    isAddressEqual(
      '0xa0cf798816d4b9b9866b5330eea46a18382f251e',
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251f',
    ),
  ).toBeFalsy()
})

describe('errors', () => {
  test('invalid address', () => {
    expect(() =>
      isAddressEqual(
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az',
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
    expect(() =>
      isAddressEqual(
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })
})
