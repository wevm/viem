import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getFeeHistory', () => {
  test('behavior: returns fee history for the latest block', async () => {
    const client = anvil.getClient(anvilMainnet)

    const history = await actions.getFeeHistory(client, {
      blockCount: 4,
      rewardPercentiles: [25, 75],
    })

    expect({
      baseFeePerGas: history.baseFeePerGas.every((v) => typeof v === 'bigint'),
      gasUsedRatio: history.gasUsedRatio.every((v) => typeof v === 'number'),
      oldestBlock: typeof history.oldestBlock,
      reward: history.reward?.every((row) =>
        row.every((v) => typeof v === 'bigint'),
      ),
    }).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": true,
        "gasUsedRatio": true,
        "oldestBlock": "bigint",
        "reward": true,
      }
    `)
  })

  test('behavior: accepts a block number', async () => {
    const client = anvil.getClient(anvilMainnet)

    await actions.mine(client, { blocks: 4n })
    const blockNumber = await actions.getBlockNumber(client, { cacheTime: 0 })

    const history = await actions.getFeeHistory(client, {
      blockCount: 2,
      blockNumber,
      rewardPercentiles: [50],
    })

    expect(history.oldestBlock).toBeLessThanOrEqual(blockNumber)
  })

  test('behavior: accepts a block tag', async () => {
    const client = anvil.getClient(anvilMainnet)

    const history = await actions.getFeeHistory(client, {
      blockCount: 1,
      blockTag: 'latest',
      rewardPercentiles: [50],
    })

    expect(typeof history.oldestBlock).toBe('bigint')
  })
})
