import { describe, expect, test } from 'vitest'

import { getAddress } from './getAddress.js'

test('checksums address', () => {
  expect(
    getAddress('0xa0cf798816d4b9b9866b5330eea46a18382f251e'),
  ).toMatchInlineSnapshot('"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"')
  expect(
    getAddress('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
  ).toMatchInlineSnapshot('"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"')
  expect(
    getAddress('0x70997970c51812dc3a010c7d01b50e0d17dc79c8'),
  ).toMatchInlineSnapshot('"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"')
  expect(
    getAddress('0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'),
  ).toMatchInlineSnapshot('"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"')
  expect(
    getAddress('0x90f79bf6eb2c4f870365e785982e1f101e93b906'),
  ).toMatchInlineSnapshot('"0x90F79bf6EB2c4f870365E785982E1f101E93b906"')
  expect(
    getAddress('0x15d34aaf54267db7d7c367839aaf71a00a2c6a65'),
  ).toMatchInlineSnapshot('"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"')
  expect(
    getAddress('0x27b1fdb04752bbc536007a920d24acb045561c26', 30),
  ).toMatchInlineSnapshot('"0x27b1FdB04752BBc536007A920D24ACB045561c26"')
  expect(
    getAddress('0x3599689e6292b81b2d85451025146515070129bb', 30),
  ).toMatchInlineSnapshot('"0x3599689E6292B81B2D85451025146515070129Bb"')
  expect(
    getAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac'),
  ).toMatchInlineSnapshot(`"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC"`)
})

describe('errors', () => {
  test('invalid address', () => {
    expect(() =>
      getAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
    expect(() =>
      getAddress('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
    expect(() =>
      getAddress('a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })
})
