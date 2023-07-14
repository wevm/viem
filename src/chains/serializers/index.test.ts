import { expect, test } from 'vitest'

import * as actions from './index.js'

test('exports', () => {
  expect(Object.keys(actions)).toMatchInlineSnapshot(`
    [
      "serializeTransactionCelo",
    ]
  `)
})
