import { Addresses } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

test('validator addresses', () => {
  expect({
    validator: Addresses.validator,
    validatorV2: Addresses.validatorV2,
  }).toMatchInlineSnapshot(`
    {
      "validator": "0xcccccccc00000000000000000000000000000000",
      "validatorV2": "0xcccccccc00000000000000000000000000000001",
    }
  `)
})

describe('portal', () => {
  test.each([
    [1, '0x5ad0000000000000000000000000000000000001'],
    [421_700_001, '0x5ad0000000000000000000000000000000000001'],
    [3, '0x5ad0000000000000000000000000000000000003'],
    [1_424_310_003, '0x5ad0000000000000000000000000000000000003'],
    [6, '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23'],
    [4_217_000_006, '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23'],
    [7, '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac'],
    [4_217_000_007, '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac'],
  ])('returns the portal for Zone %s', (id, expected) => {
    expect(Addresses.zonePortal(id)).toBe(expected)
  })
})
