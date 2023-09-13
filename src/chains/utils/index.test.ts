import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports', () => {
  expect(Object.keys(utils)).toMatchInlineSnapshot(`
    [
      "formattersCelo",
      "serializeTransactionCelo",
      "serializersCelo",
      "parseTransactionCelo",
      "formattersOptimism",
    ]
  `)
})
