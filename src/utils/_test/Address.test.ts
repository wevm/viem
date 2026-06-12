import { describe, expect, test } from 'vitest'

import * as Address from '../Address.js'

describe('from', () => {
  test('default', () => {
    expect(Address.from('0xa0cf798816d4b9b9866b5330eea46a18382f251e')).toBe(
      '0xa0cf798816d4b9b9866b5330eea46a18382f251e',
    )
    expect(Address.from('0xA0Cf798816D4b9b9866b5330EEa46a18382f251e')).toBe(
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    )
  })

  test('args: checksum', () => {
    expect(
      Address.from('0xa0cf798816d4b9b9866b5330eea46a18382f251e', {
        checksum: true,
      }),
    ).toMatchInlineSnapshot('"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"')
    expect(
      Address.from('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', {
        checksum: true,
      }),
    ).toMatchInlineSnapshot('"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"')
  })

  test('error: invalid input', () => {
    expect(() => Address.from('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az'))
      .toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
    expect(() => Address.from('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff'))
      .toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
    expect(() => Address.from('a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac'))
      .toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
  })

  test('error: invalid checksum', () => {
    expect(() => Address.from('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac'))
      .toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac" is invalid.

      Details: Address does not match its checksum counterpart.]
    `)
  })
})

describe('checksum', () => {
  test('default', () => {
    expect(
      Address.checksum('0xa0cf798816d4b9b9866b5330eea46a18382f251e'),
    ).toMatchInlineSnapshot('"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"')
    expect(
      Address.checksum('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
    ).toMatchInlineSnapshot('"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"')
    expect(
      Address.checksum('0x70997970c51812dc3a010c7d01b50e0d17dc79c8'),
    ).toMatchInlineSnapshot('"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"')
    expect(
      Address.checksum('0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'),
    ).toMatchInlineSnapshot('"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"')
    expect(
      Address.checksum('0x90f79bf6eb2c4f870365e785982e1f101e93b906'),
    ).toMatchInlineSnapshot('"0x90F79bf6EB2c4f870365E785982E1f101E93b906"')
    expect(
      Address.checksum('0x15d34aaf54267db7d7c367839aaf71a00a2c6a65'),
    ).toMatchInlineSnapshot('"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"')
    expect(
      Address.checksum('0x27b1fdb04752bbc536007a920d24acb045561c26'),
    ).toMatchInlineSnapshot('"0x27b1fdb04752bbc536007a920d24acb045561c26"')
    expect(
      Address.checksum('0x3599689e6292b81b2d85451025146515070129bb'),
    ).toMatchInlineSnapshot('"0x3599689E6292b81B2d85451025146515070129Bb"')
    expect(
      Address.checksum('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac'),
    ).toMatchInlineSnapshot('"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC"')
  })
})

describe('validate', () => {
  test('default', () => {
    expect(Address.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBe(
      false,
    )
    expect(Address.validate('x')).toBe(false)
    expect(Address.validate('0xa')).toBe(false)
    expect(Address.validate('0xa0cf798816d4b9b9866b5330eea46a18382f251e')).toBe(
      true,
    )
    expect(Address.validate('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')).toBe(
      true,
    )
    expect(Address.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az')).toBe(
      false,
    )
    expect(
      Address.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff'),
    ).toBe(false)
    expect(Address.validate('a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBe(
      false,
    )
  })

  test('args: strict', () => {
    expect(
      Address.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac', {
        strict: false,
      }),
    ).toBe(true)
    expect(
      Address.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac', {
        strict: true,
      }),
    ).toBe(false)
    expect(Address.validate('x', { strict: false })).toBe(false)
  })
})

describe('isEqual', () => {
  test('default', () => {
    expect(
      Address.isEqual(
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
        '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      ),
    ).toBe(true)
    expect(
      Address.isEqual(
        '0xa0cf798816d4b9b9866b5330eea46a18382f251e',
        '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      ),
    ).toBe(true)
    expect(
      Address.isEqual(
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
      ),
    ).toBe(true)
    expect(
      Address.isEqual(
        '0xa0cf798816d4b9b9866b5330eea46a18382f251e',
        '0xA0Cf798816D4b9b9866b5330EEa46a18382f251f',
      ),
    ).toBe(false)
  })

  test('error: invalid address', () => {
    expect(() =>
      Address.isEqual(
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az',
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
    expect(() =>
      Address.isEqual(
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac',
        '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
  })
})
