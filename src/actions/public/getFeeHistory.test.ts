import { expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'

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
        634639953n,
        649317659n,
        638630382n,
        635678744n,
        618836874n,
      ],
      "gasUsedRatio": [
        0.5925104444444445,
        0.43416302777777777,
        0.4815126944444445,
        0.39402274637913776,
      ],
      "oldestBlock": 22263620n,
      "reward": [
        [
          0n,
          114137729n,
          44365360047n,
        ],
        [
          0n,
          500000000n,
          94244384875n,
        ],
        [
          0n,
          100000000n,
          100566385920n,
        ],
        [
          0n,
          575000000n,
          84358038355n,
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
        638630382n,
        635678744n,
        618836874n,
      ],
      "gasUsedRatio": [
        0.4815126944444445,
        0.39402274637913776,
      ],
      "oldestBlock": 22263622n,
      "reward": [
        [
          0n,
          100000000n,
          100566385920n,
        ],
        [
          0n,
          575000000n,
          84358038355n,
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
        638630382n,
        635678744n,
        618836874n,
      ],
      "gasUsedRatio": [
        0.4815126944444445,
        0.39402274637913776,
      ],
      "oldestBlock": 22263622n,
      "reward": [
        [
          0n,
          44743376n,
          100000000n,
          1000000000n,
          100566385920n,
        ],
        [
          0n,
          45452235n,
          575000000n,
          2436337100n,
          84358038355n,
        ],
      ],
    }
  `)
})
