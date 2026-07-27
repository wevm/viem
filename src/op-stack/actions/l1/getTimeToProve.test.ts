import { afterAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as opStack from '~test/opStack.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

afterAll(
  () =>
    CoreActions.state.reset(client, {
      blockNumber: anvil.mainnet.forkBlockNumber,
      jsonRpcUrl: anvil.mainnet.forkUrl,
    }),
  60_000,
)

const disputeGameReceipt = opStack.getReceipt({
  blockNumber: 144_991_160n,
  logs: [],
  transactionHash:
    '0x71490b686eaefd6e20d05aeb3feb898bfc7801e50b967d2f9eb5a057b8a7e855',
})

const legacyReceipt = opStack.getReceipt({
  blockNumber: 113_388_533n,
  logs: [],
  transactionHash:
    '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
})

test('estimates a modern proof', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  const time = await Actions.l1.getTimeToProve(client, {
    receipt: disputeGameReceipt,
    targetChain: optimism,
  })

  expect(time).toMatchInlineSnapshot(`
    {
      "interval": 3615,
      "seconds": 0,
    }
  `)
}, 60_000)

test('estimates a legacy proof', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 18_772_363n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  const time = await Actions.l1.getTimeToProve(client, {
    receipt: legacyReceipt,
    targetChain: optimism,
  })

  expect(time).toMatchInlineSnapshot(`
    {
      "interval": 3600,
      "seconds": 0,
    }
  `)
}, 60_000)
