import { expect, test } from 'vitest'

import { walletClient } from '../../../test'

import { requestAccounts } from './requestAccounts'

test('fetches block number', async () => {
  expect(await requestAccounts(walletClient!)).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `)
})
