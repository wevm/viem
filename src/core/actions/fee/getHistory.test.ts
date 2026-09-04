import { Value } from 'ox'
import { beforeAll, expect, test } from 'vitest'
import { Actions, testActions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.history)
const testClient = client.extend(testActions())

const source = constants.accounts[0]
const to = constants.accounts[1].address

// Seeds blocks 1-4, each holding one transfer with a known priority fee.
// Idempotent by height, so retries and shared workers see identical history.
beforeAll(async () => {
  for (
    let height = Number(await Actions.block.getNumber(client));
    height < 4;
    height++
  ) {
    await Actions.transaction.send(client, {
      account: source.address,
      maxFeePerGas: Value.fromGwei('10'),
      maxPriorityFeePerGas: Value.fromGwei(String(height + 1)),
      to,
      value: 1n,
    })
    await testClient.block.mine({ blocks: 1 })
  }
})

test('default', async () => {
  const feeHistory = await Actions.fee.getHistory(client, {
    blockCount: 4,
    blockNumber: 4n,
    rewardPercentiles: [25, 75],
  })
  expect(feeHistory).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        1000000000n,
        875175000n,
        765931281n,
        670323909n,
        586650728n,
      ],
      "gasUsedRatio": [
        0.0007,
        0.0007,
        0.0007,
        0.0007,
      ],
      "oldestBlock": 1n,
      "reward": [
        [
          1000000000n,
          1000000000n,
        ],
        [
          2000000000n,
          2000000000n,
        ],
        [
          3000000000n,
          3000000000n,
        ],
        [
          4000000000n,
          4000000000n,
        ],
      ],
    }
  `)
})

test('args: blockTag', async () => {
  const feeHistory = await Actions.fee.getHistory(client, {
    blockCount: 2,
    blockTag: 'latest',
    rewardPercentiles: [25, 75],
  })
  expect(feeHistory).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        765931281n,
        670323909n,
        586650728n,
      ],
      "gasUsedRatio": [
        0.0007,
        0.0007,
      ],
      "oldestBlock": 3n,
      "reward": [
        [
          3000000000n,
          3000000000n,
        ],
        [
          4000000000n,
          4000000000n,
        ],
      ],
    }
  `)
})

test('args: no rewardPercentiles', async () => {
  const feeHistory = await Actions.fee.getHistory(client, {
    blockCount: 2,
    blockNumber: 4n,
    rewardPercentiles: [],
  })
  expect(feeHistory.reward).toMatchInlineSnapshot(`[]`)
})
