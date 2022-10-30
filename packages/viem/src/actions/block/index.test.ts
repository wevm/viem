import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "fetchBlock": [Function],
      "fetchBlockNumber": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
    }
  `)
})
