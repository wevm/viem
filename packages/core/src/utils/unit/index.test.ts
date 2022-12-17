import { expect, test } from 'vitest'

import * as value from './index'

test('exports value utils', () => {
  expect(value).toMatchInlineSnapshot(`
    {
      "displayToValue": [Function],
      "etherToValue": [Function],
      "gweiToValue": [Function],
      "valueAsEther": [Function],
      "valueAsGwei": [Function],
      "valueToDisplay": [Function],
    }
  `)
})
