import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "getEventSelector": [Function],
      "getFunctionSelector": [Function],
      "hashMessage": [Function],
      "keccak256": [Function],
    }
  `)
})
