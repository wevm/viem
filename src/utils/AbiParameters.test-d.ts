import { describe, expectTypeOf, test } from 'vp/test'

import { AbiParameters, type Address } from './index.js'

describe('decode', () => {
  test('types: infers tuple and object output', () => {
    const parameters = AbiParameters.from('address account, uint256 value')
    const tuple = AbiParameters.decode(parameters, '0x')
    const object = AbiParameters.decode(parameters, '0x', { as: 'Object' })

    expectTypeOf(tuple).toEqualTypeOf<readonly [Address.Address, bigint]>()
    expectTypeOf(object).toEqualTypeOf<{
      account: Address.Address
      value: bigint
    }>()
  })
})
