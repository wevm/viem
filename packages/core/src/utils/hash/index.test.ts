import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "getEventSignature": [Function],
      "getSignature": [Function],
      "keccak256": [Function],
    }
  `)
})
