import { describe, expect, test } from 'vp/test'

import { AbiParameters } from './index.js'

const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
const checksumAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('decode', () => {
  test('behavior: checksums decoded addresses by default', () => {
    const parameters = AbiParameters.from('address account, uint256 value')
    const data = AbiParameters.encode(parameters, [address, 420n])

    expect(AbiParameters.decode(parameters, data)).toMatchInlineSnapshot(`
      [
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        420n,
      ]
    `)
  })

  test('behavior: supports object output', () => {
    const parameters = AbiParameters.from('address account, uint256 value')
    const data = AbiParameters.encode(parameters, [address, 420n])

    expect(AbiParameters.decode(parameters, data, { as: 'Object' }))
      .toMatchInlineSnapshot(`
        {
          "account": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          "value": 420n,
        }
      `)
  })

  test('behavior: supports lowercase decoded addresses', () => {
    const parameters = AbiParameters.from('address account')
    const data = AbiParameters.encode(parameters, [checksumAddress])

    expect(AbiParameters.decode(parameters, data, { checksumAddress: false }))
      .toMatchInlineSnapshot(`
      [
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      ]
    `)
  })
})
