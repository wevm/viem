import { expect, test } from 'vitest'
import { InvalidAddressError, InvalidHashError } from './address'

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

test('InvalidHashError', () => {
  expect(
    new InvalidHashError({
      hash: ['0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az'],
    }),
  ).toMatchInlineSnapshot(`
    [InvalidHashError: Contains invalid hash values.
    
    0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az

    Version: viem@1.0.2]
  `)
})
