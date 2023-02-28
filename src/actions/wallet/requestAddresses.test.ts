import { expect, test } from 'vitest'

import { walletClient } from '../../_test'

import { requestAddresses } from './requestAddresses'

test('requests accounts', async () => {
  expect(await requestAddresses(walletClient!)).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `)
})
