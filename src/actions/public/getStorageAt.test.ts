import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import type { Hex } from 'viem/utils'

const address = '0x0000000000000000000000000000000000000104'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('getStorageAt', () => {
  test('behavior: returns storage for an address slot', async () => {
    await request(anvilMainnet, 'anvil_setStorageAt', [address, slot, value])
    await request(anvilMainnet, 'evm_mine')

    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const blockHash = await getLatestBlockHash()
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

async function getLatestBlockHash() {
  const block = await request<{ hash: Hex.Hex }>(
    anvilMainnet,
    'eth_getBlockByNumber',
    ['latest', false],
  )
  return block.hash
}
