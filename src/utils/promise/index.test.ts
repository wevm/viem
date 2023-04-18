import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "createBatchScheduler": [Function],
      "getCache": [Function],
      "withCache": [Function],
      "withRetry": [Function],
      "withTimeout": [Function],
    }
  `)
})
