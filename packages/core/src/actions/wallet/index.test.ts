import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "InvalidGasArgumentsError": [Function],
      "getAccounts": [Function],
      "requestAccounts": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
    }
  `)
})
