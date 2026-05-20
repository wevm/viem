import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import * as Client from '../../core/Client.js'
import { http } from '../../core/transports/index.js'
import { getBlockNumber } from './getBlockNumber.js'

describe('getBlockNumber', () => {
  test('behavior: returns the latest block number as a bigint', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const blockNumber = await getBlockNumber(client)

    expect(typeof blockNumber).toMatchInlineSnapshot(`"bigint"`)
  })

  test('behavior: caches by client uid', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const cached = await getBlockNumber(client)
    await request(anvilMainnet, 'evm_mine')
    const stillCached = await getBlockNumber(client)
    const latest = await getBlockNumber(client, { cacheTime: 0 })

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
