import type * as Fee from 'ox/Fee'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'

import { getFeeHistory } from './getFeeHistory.js'

const client = Client.create({ transport: http() })

test('default: returns a fee history', async () => {
  const feeHistory = await getFeeHistory(client, {
    blockCount: 4,
    rewardPercentiles: [25, 75],
  })
  expectTypeOf(feeHistory).toEqualTypeOf<Fee.FeeHistory>()
})

test('args: blockNumber and blockTag are mutually exclusive', async () => {
  await getFeeHistory(client, {
    blockCount: 4,
    blockNumber: 1n,
    rewardPercentiles: [25, 75],
  })
  await getFeeHistory(client, {
    blockCount: 4,
    blockTag: 'latest',
    rewardPercentiles: [25, 75],
  })
  await getFeeHistory(client, {
    blockCount: 4,
    blockNumber: 1n,
    // @ts-expect-error cannot pass both blockNumber and blockTag
    blockTag: 'latest',
    rewardPercentiles: [25, 75],
  })
})
