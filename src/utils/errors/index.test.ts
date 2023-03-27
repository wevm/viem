import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "containsNodeError": [Function],
      "getCallError": [Function],
      "getContractError": [Function],
      "getEstimateGasError": [Function],
      "getNodeError": [Function],
      "getTransactionError": [Function],
    }
  `)
})
