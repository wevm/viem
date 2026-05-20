import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getBlockNumber', () => {
  test('behavior: returns the latest block number as a bigint', async () => {
    const client = anvil.getClient(anvilMainnet)

    const blockNumber = await actions.getBlockNumber(client)

    expect(typeof blockNumber).toMatchInlineSnapshot(`"bigint"`)
  })

  test('behavior: caches by client uid', async () => {
    const client = anvil.getClient(anvilMainnet)

    const cached = await actions.getBlockNumber(client)
    await actions.mine(client, { blocks: 1n })
    const stillCached = await actions.getBlockNumber(client)
    const latest = await actions.getBlockNumber(client, { cacheTime: 0 })

    expect({
      cacheHit: stillCached === cached,
      refreshed: latest > stillCached,
    }).toMatchInlineSnapshot(`
      {
        "cacheHit": true,
        "refreshed": true,
      }
    `)
  })
})
