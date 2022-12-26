import { expect, test } from 'vitest'

import * as value from './index'

test('exports value utils', () => {
  expect(value).toMatchInlineSnapshot(`
    {
      "formatEther": [Function],
      "formatGwei": [Function],
      "formatUnit": [Function],
      "parseEther": [Function],
      "parseGwei": [Function],
      "parseUnit": [Function],
    }
  `)
})
