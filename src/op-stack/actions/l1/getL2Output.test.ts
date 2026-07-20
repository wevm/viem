import { afterAll, beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

afterAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 60_000)

test('returns a dispute-game output', async () => {
  const output = await Actions.l1.getL2Output(client, {
    l2BlockNumber: 144_990_134n,
    limit: 3,
    targetChain: optimism,
  })

  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 144991861n,
      "outputIndex": 13219n,
      "outputRoot": "0xb767f8b50875a8f60d71ad79e6d1e7a1bda2a640ffa215cb453211b3f5d7aa9f",
      "timestamp": 1765583711n,
    }
  `)
})

test('returns a legacy output', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 18_772_363n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  const output = await Actions.l1.getL2Output(client, {
    l2BlockNumber: 113_400_763n,
    targetChain: optimism,
  })

  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 113401663n,
      "outputIndex": 4536n,
      "outputRoot": "0xe1cbff6699172e5b10391f4329c8b0a490c2d089ff7d68f53fb386b6da6e9043",
      "timestamp": 1702403231n,
    }
  `)
})
