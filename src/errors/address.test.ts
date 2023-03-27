import { expect, test } from 'vitest'
import { InvalidAddressError } from './address.js'

test('InvalidAddressError', () => {
  expect(
    new InvalidAddressError({
      address: '0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidAddressError: Address "0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az" is invalid.

    Version: viem@1.0.2]
  `)
})
