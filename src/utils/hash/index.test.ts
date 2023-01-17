import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "getEventSignature": [Function],
      "getFunctionSignature": [Function],
      "keccak256": [Function],
    }
  `)
})
