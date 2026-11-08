import { test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'

const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  await Actions.wallet.disconnect(client)
})
