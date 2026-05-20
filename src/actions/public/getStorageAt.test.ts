import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

const address = '0x0000000000000000000000000000000000000104'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('getStorageAt', () => {
  test('behavior: returns storage for an address slot', async () => {
    const client = anvil.getClient(anvilMainnet)

    await actions.setStorageAt(client, { address, slot, value })
    await actions.mine(client, { blocks: 1n })

    const { hash: blockHash } = await actions.getBlock(client)
    const blockNumber = await actions.getBlockNumber(client, {
      cacheTime: 0,
    })

    expect({
      blockHash: await actions.getStorageAt(client, {
        address,
        blockHash,
        slot,
      }),
      blockHashCanonical: await actions.getStorageAt(client, {
        address,
        blockHash,
        requireCanonical: true,
        slot,
      }),
      blockNumber: await actions.getStorageAt(client, {
        address,
        blockNumber,
        slot,
      }),
      latest: await actions.getStorageAt(client, { address, slot }),
    }).toMatchInlineSnapshot(`
      {
        "blockHash": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "blockHashCanonical": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "blockNumber": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "latest": "0x000000000000000000000000000000000000000000000000000000000000002a",
      }
    `)
  })
})
