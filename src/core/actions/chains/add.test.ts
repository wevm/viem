import { test } from 'vitest'
import { Actions } from 'viem'
import { avalanche } from 'viem/chains'

import * as anvil from '~test/anvil.js'

const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  await Actions.chains.add(client, { chain: avalanche })
})

test('no block explorer', async () => {
  await Actions.chains.add(client, {
    chain: { ...avalanche, blockExplorers: undefined },
  })
})
