import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getFeeHistory } from './getFeeHistory.js'

const client = getClient(anvilMainnet)

describe('getFeeHistory', () => {
  test('default', async () => {
    const feeHistory = await getFeeHistory(client, {
      blockCount: 4,
      blockNumber: anvilMainnet.forkBlockNumber,
      rewardPercentiles: [25, 75],
    })
    expect(feeHistory).toMatchInlineSnapshot(`
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
          0.48151269444444444,
          0.39402274637913776,
        ],
        "oldestBlock": 22263620n,
        "reward": [
          [
            33147325n,
            1083762509n,
          ],
          [
            7094406n,
            2000000000n,
          ],
          [
            44743376n,
            1000000000n,
          ],
          [
            45452235n,
            2436337100n,
          ],
        ],
      }
    `)
  })

  test('args: blockTag', async () => {
    const feeHistory = await getFeeHistory(client, {
      blockCount: 4,
      blockTag: 'latest',
      rewardPercentiles: [25, 75],
    })
    expect(feeHistory.baseFeePerGas.length).toBe(5)
    expect(feeHistory.reward?.length).toBe(4)
  })

  test('args: no rewardPercentiles', async () => {
    const feeHistory = await getFeeHistory(client, {
      blockCount: 2,
      blockNumber: anvilMainnet.forkBlockNumber,
      rewardPercentiles: [],
    })
    expect(feeHistory.reward).toMatchInlineSnapshot(`undefined`)
  })
})
