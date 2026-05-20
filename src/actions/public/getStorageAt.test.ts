import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import * as Client from '../../core/Client.js'
import { http } from '../../core/transports/index.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getStorageAt } from './getStorageAt.js'

const address = '0x0000000000000000000000000000000000000104'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('getStorageAt', () => {
  test('behavior: returns storage for an address slot', async () => {
    await request(anvilMainnet, 'anvil_setStorageAt', [address, slot, value])

    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const blockNumber = await getBlockNumber(client, { cacheTime: 0 })

    expect({
      blockNumber: await getStorageAt(client, { address, blockNumber, slot }),
      latest: await getStorageAt(client, { address, slot }),
    }).toMatchInlineSnapshot(`
      {
        "blockNumber": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "latest": "0x000000000000000000000000000000000000000000000000000000000000002a",
      }
    `)
  })
})
