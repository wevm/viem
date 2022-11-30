import { expect, test } from 'vitest'

import { walletRpc } from '../../../../test/src/utils'

import { requestAccountAddresses } from './requestAccountAddresses'

test('fetches block number', async () => {
  expect(await requestAccountAddresses(walletRpc!)).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `)
})
