import { expect, test } from 'vitest'
import { Addresses } from 'viem/tempo'

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
