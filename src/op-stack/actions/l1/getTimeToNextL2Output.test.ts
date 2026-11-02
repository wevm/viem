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
    blockNumber: 18_772_363n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 60_000)

test('estimates the next output', async () => {
  const time = await Actions.l1.getTimeToNextL2Output(client, {
    l2BlockNumber: 113_405_763n,
    targetChain: optimism,
  })

  expect({
    interval: time.interval,
    secondsPositive: time.seconds > 0,
    timestampFuture:
      time.timestamp !== undefined && time.timestamp > Date.now(),
  }).toMatchInlineSnapshot(`
    {
      "interval": 3600,
      "secondsPositive": true,
      "timestampFuture": true,
    }
  `)
})

test('returns immediately when the latest output is newer', async () => {
  const time = await Actions.l1.getTimeToNextL2Output(client, {
    l2BlockNumber: 113_400_763n,
    targetChain: optimism,
  })

  expect(time).toMatchInlineSnapshot(`
    {
      "interval": 3600,
      "seconds": 0,
    }
  `)
})

test('accounts for multiple output intervals', async () => {
  const time = await Actions.l1.getTimeToNextL2Output(client, {
    l2BlockNumber: 113_409_263n,
    targetChain: optimism,
  })

  expect({
    interval: time.interval,
    spansMultipleIntervals: time.seconds > 3960,
    timestampFuture:
      time.timestamp !== undefined && time.timestamp > Date.now(),
  }).toMatchInlineSnapshot(`
    {
      "interval": 3600,
      "spansMultipleIntervals": true,
      "timestampFuture": true,
    }
  `)
})
