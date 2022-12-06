import { expect, test } from 'vitest'

import { walletClient } from '../../../test'

import { requestAccountAddresses } from './requestAccountAddresses'

test('fetches block number', async () => {
  expect(await requestAccountAddresses(walletClient!)).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `)
})
