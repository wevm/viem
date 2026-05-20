import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getLogs', () => {
  test('behavior: returns an empty array when no logs match', async () => {
    const client = anvil.getClient(anvilMainnet)

    const logs = await actions.getLogs(client, {
      address: '0x0000000000000000000000000000000000000000',
      fromBlock: 0n,
      toBlock: 'latest',
    })

    expect(logs).toMatchInlineSnapshot(`[]`)
  })

  test('behavior: returns logs by blockHash', async () => {
    const client = anvil.getClient(anvilMainnet)

    const { hash: blockHash } = await actions.getBlock(client)

    const logs = await actions.getLogs(client, { blockHash })

    expect(Array.isArray(logs)).toBe(true)
  })

  test('behavior: filters by topics', async () => {
    const client = anvil.getClient(anvilMainnet)

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
