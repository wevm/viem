import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: optimism,
  transport: http(anvil.optimism.rpcUrl.http),
})
const request = {
  account: constants.accounts[0].address,
  to: constants.accounts[1].address,
  value: 1n,
} as const
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.optimism.forkBlockNumber,
    jsonRpcUrl: optimism.rpcUrls.http,
  })
}, 30_000)

liveTest('getL1BaseFee', async () => {
  const fee = await Actions.l2.getL1BaseFee(client)
  expect(fee).toBeGreaterThan(0n)
})

liveTest('estimateL1Fee', async () => {
  const fee = await Actions.l2.estimateL1Fee(client, request)
  expect(fee).toBeGreaterThan(0n)
})

liveTest('estimateOperatorFee', async () => {
  const fee = await Actions.l2.estimateOperatorFee(client, request)
  expect(fee).toMatchInlineSnapshot(`0n`)
})
