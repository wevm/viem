import { expect, test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'

const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  expect(await Actions.wallet.requestAddresses(client)).toMatchInlineSnapshot(`
    [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ]
  `)
})
