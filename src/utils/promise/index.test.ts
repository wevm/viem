import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "getCache": [Function],
      "withCache": [Function],
      "withRetry": [Function],
      "withTimeout": [Function],
    }
  `)
})
