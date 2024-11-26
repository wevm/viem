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
        7975081261n,
        8971754480n,
        9036579667n,
        8758571930n,
        8660467020n,
      ],
      "gasUsedRatio": [
        0.9998937,
        0.5289019,
        0.37694116666666666,
        0.45519593333333336,
      ],
      "oldestBlock": 19868017n,
      "reward": [
        [
          0n,
          155751813n,
          100000000000n,
        ],
        [
          0n,
          155751813n,
          11028245520n,
        ],
        [
          0n,
          300000000n,
          18152944408993n,
        ],
        [
          0n,
          500000004n,
          81241428070n,
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
        9036579667n,
        8758571930n,
        8660467020n,
      ],
      "gasUsedRatio": [
        0.37694116666666666,
        0.45519593333333336,
      ],
      "oldestBlock": 19868019n,
      "reward": [
        [
          0n,
          300000000n,
          18152944408993n,
        ],
        [
          0n,
          500000004n,
          81241428070n,
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
        9036579667n,
        8758571930n,
        8660467020n,
      ],
      "gasUsedRatio": [
        0.37694116666666666,
        0.45519593333333336,
      ],
      "oldestBlock": 19868019n,
      "reward": [
        [
          0n,
          66924164n,
          300000000n,
          1533517846n,
          18152944408993n,
        ],
        [
          0n,
          66924164n,
          500000004n,
          2000000000n,
          81241428070n,
        ],
      ],
    }
  `)
})
