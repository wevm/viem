import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getFilterLogs', () => {
  test('behavior: returns logs for an event filter', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createEventFilter(client, {
      address: '0x0000000000000000000000000000000000000000',
      fromBlock: 0n,
      toBlock: 'latest',
    })

    const logs = await actions.getFilterLogs(client, { filterId })

    expect(logs).toMatchInlineSnapshot(`[]`)
  })

  test('behavior: filters by topics', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createEventFilter(client, {
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ],
      fromBlock: 0n,
      toBlock: 'latest',
    })

    const logs = await actions.getFilterLogs(client, { filterId })

    expect(logs.every((log) => typeof log.blockNumber === 'bigint')).toBe(true)
  })
})
