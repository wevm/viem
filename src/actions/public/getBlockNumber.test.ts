import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'

describe('getBlockNumber', () => {
  test('behavior: returns the latest block number as a bigint', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const blockNumber = await actions.getBlockNumber(client)

    expect(typeof blockNumber).toMatchInlineSnapshot(`"bigint"`)
  })

  test('behavior: caches by client uid', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const cached = await actions.getBlockNumber(client)
    await request(anvilMainnet, 'evm_mine')
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
