import { expect, test } from 'vitest'

import { initialBlockNumber, publicClient } from '../../_test/index.js'
import { getFeeHistory } from './getFeeHistory.js'

test('default', async () => {
  expect(
    await getFeeHistory(publicClient, {
      blockCount: 4,
      blockNumber: initialBlockNumber,
      rewardPercentiles: [0, 50, 100],
    }),
  ).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        13539253648n,
        13242020772n,
        13091396207n,
        12779459001n,
        13197182029n,
      ],
      "gasUsedRatio": [
        0.4121863333333333,
        0.45450103333333336,
        0.4046894,
        0.6307482666666666,
      ],
      "oldestBlock": 16280767n,
      "reward": [
        [
          120746352n,
          1500000000n,
          36460746352n,
        ],
        [
          0n,
          1500000000n,
          61757979228n,
        ],
        [
          92613505n,
          1500000000n,
          20336529954n,
        ],
        [
          0n,
          1500000000n,
          20228167552n,
        ],
      ],
    }
  `)
})

test('args: blockTag', async () => {
  expect(
    await getFeeHistory(publicClient, {
      blockCount: 4,
      blockTag: 'safe',
      rewardPercentiles: [0, 50, 100],
    }),
  ).toBeDefined()
})

test('args: blockCount', async () => {
  expect(
    await getFeeHistory(publicClient, {
      blockCount: 2,
      blockNumber: initialBlockNumber,
      rewardPercentiles: [0, 50, 100],
    }),
  ).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        13091396207n,
        12779459001n,
        13197182029n,
      ],
      "gasUsedRatio": [
        0.4046894,
        0.6307482666666666,
      ],
      "oldestBlock": 16280769n,
      "reward": [
        [
          92613505n,
          1500000000n,
          20336529954n,
        ],
        [
          0n,
          1500000000n,
          20228167552n,
        ],
      ],
    }
  `)
})

test('args: rewardPercentiles', async () => {
  expect(
    await getFeeHistory(publicClient, {
      blockCount: 2,
      blockNumber: initialBlockNumber,
      rewardPercentiles: [0, 25, 50, 75, 100],
    }),
  ).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": [
        13091396207n,
        12779459001n,
        13197182029n,
      ],
      "gasUsedRatio": [
        0.4046894,
        0.6307482666666666,
      ],
      "oldestBlock": 16280769n,
      "reward": [
        [
          92613505n,
          1500000000n,
          1500000000n,
          2000000000n,
          20336529954n,
        ],
        [
          0n,
          759000000n,
          1500000000n,
          1500000000n,
          20228167552n,
        ],
      ],
    }
  `)
})
