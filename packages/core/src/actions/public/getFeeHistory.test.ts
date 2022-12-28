import { expect, test } from 'vitest'

import { initialBlockNumber, publicClient } from '../../../test'
import { getFeeHistory } from './getFeeHistory'

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
        10645242114n,
        10040134988n,
        10789405161n,
        10197021454n,
        9718023255n,
      ],
      "gasUsedRatio": [
        0.2726281302071925,
        0.79851,
        0.2803831724987217,
        0.3121027,
      ],
      "oldestBlock": 15131997n,
      "reward": [
        [
          1000000000n,
          2500000000n,
          30239757886n,
        ],
        [
          1000000000n,
          1500000000n,
          76959865012n,
        ],
        [
          150025540n,
          2000000000n,
          46210594839n,
        ],
        [
          1000000000n,
          1517001353n,
          34802978546n,
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
        10789405161n,
        10197021454n,
        9718023255n,
      ],
      "gasUsedRatio": [
        0.2803831724987217,
        0.3121027,
      ],
      "oldestBlock": 15131999n,
      "reward": [
        [
          150025540n,
          2000000000n,
          46210594839n,
        ],
        [
          1000000000n,
          1517001353n,
          34802978546n,
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
        10789405161n,
        10197021454n,
        9718023255n,
      ],
      "gasUsedRatio": [
        0.2803831724987217,
        0.3121027,
      ],
      "oldestBlock": 15131999n,
      "reward": [
        [
          150025540n,
          1000000000n,
          2000000000n,
          2500000000n,
          46210594839n,
        ],
        [
          1000000000n,
          1500000000n,
          1517001353n,
          2500000000n,
          34802978546n,
        ],
      ],
    }
  `)
})
