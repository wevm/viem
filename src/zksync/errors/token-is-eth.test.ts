import { expect, test } from 'vitest'
import { TokenIsEthError } from './token-is-eth.js'

test('TokenIsEthError', () => {
  expect(new TokenIsEthError()).toMatchInlineSnapshot(`
    [TokenIsEthError: Token is an ETH token.

    ETH token cannot be retrieved.

    Version: viem@x.y.z]
  `)
})
