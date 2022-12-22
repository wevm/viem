import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getBalance": [Function],
      "getTransactionCount": [Function],
      "requestAccounts": [Function],
    }
  `)
})
