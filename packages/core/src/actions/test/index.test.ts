import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getAutomine": [Function],
      "impersonateAccount": [Function],
      "mine": [Function],
      "setAutomine": [Function],
      "setBalance": [Function],
      "setCode": [Function],
      "setIntervalMining": [Function],
      "setNonce": [Function],
      "setStorageAt": [Function],
      "stopImpersonatingAccount": [Function],
    }
  `)
})
