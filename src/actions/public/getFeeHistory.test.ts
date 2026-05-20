import { describe, expect, test } from 'vp/test'

import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { anvilMainnet, request } from '../../../test/anvil.js'

describe('getFeeHistory', () => {
  test('behavior: returns fee history for the latest block', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

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
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await request(anvilMainnet, 'anvil_mine', ['0x4'])
    const blockNumberHex = await request<`0x${string}`>(
      anvilMainnet,
      'eth_blockNumber',
    )
    const blockNumber = BigInt(blockNumberHex)

    const history = await actions.getFeeHistory(client, {
      blockCount: 2,
      blockNumber,
      rewardPercentiles: [50],
    })

    expect(history.oldestBlock).toBeLessThanOrEqual(blockNumber)
  })

  test('behavior: accepts a block tag', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const history = await actions.getFeeHistory(client, {
      blockCount: 1,
      blockTag: 'latest',
      rewardPercentiles: [50],
    })

    expect(typeof history.oldestBlock).toBe('bigint')
  })
})
