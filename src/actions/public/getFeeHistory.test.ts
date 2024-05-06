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
        5213557505n,
        4699268689n,
        5240957424n,
        5087991129n,
        5092610982n,
      ],
      "gasUsedRatio": [
        0.10542196666666669,
        0.9610834333333332,
        0.38325316666666664,
        0.5036319666666667,
      ],
      "oldestBlock": 19808247n,
      "reward": [
        [
          1000000000n,
          2000000000n,
          39786442495n,
        ],
        [
          0n,
          369076887n,
          118577352971n,
        ],
        [
          0n,
          41648601n,
          6972600081n,
        ],
        [
          0n,
          162008871n,
          7900000000n,
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
        5240957424n,
        5087991129n,
        5092610982n,
      ],
      "gasUsedRatio": [
        0.38325316666666664,
        0.5036319666666667,
      ],
      "oldestBlock": 19808249n,
      "reward": [
        [
          0n,
          41648601n,
          6972600081n,
        ],
        [
          0n,
          162008871n,
          7900000000n,
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
        5240957424n,
        5087991129n,
        5092610982n,
      ],
      "gasUsedRatio": [
        0.38325316666666664,
        0.5036319666666667,
      ],
      "oldestBlock": 19808249n,
      "reward": [
        [
          0n,
          10000000n,
          41648601n,
          500000000n,
          6972600081n,
        ],
        [
          0n,
          90000000n,
          162008871n,
          500000000n,
          7900000000n,
        ],
      ],
    }
  `)
})
