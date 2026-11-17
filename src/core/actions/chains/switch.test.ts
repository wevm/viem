import { expect, test } from 'vitest'
import { Actions } from 'viem'
import { avalanche, fantom } from 'viem/chains'

import * as anvil from '~test/anvil.js'

const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  await Actions.chains.switch(client, { id: avalanche.id })
})

test('unsupported chain', async () => {
  await expect(
    Actions.chains.switch(client, { id: fantom.id }),
  ).rejects.toMatchInlineSnapshot(
    '[Provider.SwitchChainError: Unrecognized chain.]',
  )
})
