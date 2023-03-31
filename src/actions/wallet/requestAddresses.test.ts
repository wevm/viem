import { expect, test } from 'vitest'

import { walletClient } from '../../_test/index.js'

import { requestAddresses } from './requestAddresses.js'

test('requests accounts', async () => {
  expect(await requestAddresses(walletClient!)).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `)
})
