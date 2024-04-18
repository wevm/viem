import { expect, test } from 'vitest'
import { TokenIsETHError } from './token-is-eth.js'

test('TokenIsETHError', () => {
  expect(new TokenIsETHError()).toMatchInlineSnapshot(`
      [TokenIsETHError: Token is an ETH token.

      ETH token can't be retrived!
      
      Version: viem@1.0.2]
  `)
})
