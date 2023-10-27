import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports', () => {
  expect(Object.keys(utils)).toMatchInlineSnapshot(`
    [
      "assertCurrentChain",
      "defineChain",
      "extractChain",
      "getChainContractAddress",
      "formattersCelo",
      "serializeTransactionCelo",
      "serializersCelo",
      "parseTransactionCelo",
      "formattersOptimism",
      "formattersZkSync",
    ]
  `)
})
