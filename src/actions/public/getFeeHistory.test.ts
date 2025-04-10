import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getFeeHistory } from './getFeeHistory.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(
    await getFeeHistory(client, {
      blockCount: 4,
      blockNumber: anvilMainnet.forkBlockNumber,
      rewardPercentiles: [0, 50, 100],
    }),
  ).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        548745628n,
        607463544n,
        556703106n,
        578808939n,
        522704890n,
      ],
      "gasUsedRatio": [
        0.92801552869643,
        0.16575483333333332,
        0.6588339166666667,
        0.11227931053227116,
      ],
      "oldestBlock": 22180094n,
      "reward": [
        [
          0n,
          13630320n,
          9168825779n,
        ],
        [
          1n,
          79000000n,
          9392536456n,
        ],
        [
          0n,
          184885537n,
          100566385920n,
        ],
        [
          10000000n,
          100000000n,
          9986639025n,
        ],
      ],
    }
  `)
})

test('args: blockTag', async () => {
  expect(
    await getFeeHistory(client, {
      blockCount: 4,
      blockTag: 'safe',
      rewardPercentiles: [0, 50, 100],
    }),
  ).toBeDefined()
})

test('args: blockCount', async () => {
  expect(
    await getFeeHistory(client, {
      blockCount: 2,
      blockNumber: anvilMainnet.forkBlockNumber,
      rewardPercentiles: [0, 50, 100],
    }),
  ).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        556703106n,
        578808939n,
        522704890n,
      ],
      "gasUsedRatio": [
        0.6588339166666667,
        0.11227931053227116,
      ],
      "oldestBlock": 22180096n,
      "reward": [
        [
          0n,
          184885537n,
          100566385920n,
        ],
        [
          10000000n,
          100000000n,
          9986639025n,
        ],
      ],
    }
  `)
})

test('args: rewardPercentiles', async () => {
  expect(
    await getFeeHistory(client, {
      blockCount: 2,
      blockNumber: anvilMainnet.forkBlockNumber,
      rewardPercentiles: [0, 25, 50, 75, 100],
    }),
  ).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        556703106n,
        578808939n,
        522704890n,
      ],
      "gasUsedRatio": [
        0.6588339166666667,
        0.11227931053227116,
      ],
      "oldestBlock": 22180096n,
      "reward": [
        [
          0n,
          50000000n,
          184885537n,
          500000000n,
          100566385920n,
        ],
        [
          10000000n,
          10000000n,
          100000000n,
          500000000n,
          9986639025n,
        ],
      ],
    }
  `)
})
