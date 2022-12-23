import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getAutomine": [Function],
      "impersonateAccount": [Function],
      "increaseTime": [Function],
      "mine": [Function],
      "removeBlockTimestampInterval": [Function],
      "setAutomine": [Function],
      "setBalance": [Function],
      "setBlockTimestampInterval": [Function],
      "setCode": [Function],
      "setIntervalMining": [Function],
      "setNonce": [Function],
      "setStorageAt": [Function],
      "stopImpersonatingAccount": [Function],
    }
  `)
})
