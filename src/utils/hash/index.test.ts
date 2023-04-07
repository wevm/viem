import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "getEventSelector": [Function],
      "getFunctionSelector": [Function],
      "isHash": [Function],
      "keccak256": [Function],
    }
  `)
})
