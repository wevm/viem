import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getBlock": [Function],
      "getBlockNumber": [Function],
      "getBlockTransactionCount": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
    }
  `)
})
