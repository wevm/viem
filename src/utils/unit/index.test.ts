import { expect, test } from 'vitest'

import * as value from './index'

test('exports value utils', () => {
  expect(value).toMatchInlineSnapshot(`
    {
      "formatEther": [Function],
      "formatGwei": [Function],
      "formatUnits": [Function],
      "parseEther": [Function],
      "parseGwei": [Function],
      "parseUnits": [Function],
    }
  `)
})
