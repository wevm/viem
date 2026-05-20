import { describe, expect, test } from 'vp/test'

import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'
import { anvilMainnet, request } from '../../../test/anvil.js'

describe('getLogs', () => {
  test('behavior: returns an empty array when no logs match', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const logs = await actions.getLogs(client, {
      address: '0x0000000000000000000000000000000000000000',
      fromBlock: 0n,
      toBlock: 'latest',
    })

    expect(logs).toMatchInlineSnapshot(`[]`)
  })

  test('behavior: returns logs by blockHash', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const blockHash = await request<Hex.Hex>(anvilMainnet, 'eth_blockNumber')
    const block = await request<{ hash: Hex.Hex }>(
      anvilMainnet,
      'eth_getBlockByNumber',
      [blockHash, false],
    )

    const logs = await actions.getLogs(client, {
      blockHash: block.hash,
    })

    expect(Array.isArray(logs)).toBe(true)
  })

  test('behavior: filters by topics', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const logs = await actions.getLogs(client, {
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ],
      fromBlock: 0n,
      toBlock: 'latest',
    })

    expect(logs.every((log) => typeof log.blockNumber === 'bigint')).toBe(true)
  })
})
