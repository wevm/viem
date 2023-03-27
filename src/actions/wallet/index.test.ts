import { expect, test } from 'vitest'

import * as actions from './index.js'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "addChain": [Function],
      "deployContract": [Function],
      "getAddresses": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "switchChain": [Function],
      "watchAsset": [Function],
      "writeContract": [Function],
    }
  `)
})
