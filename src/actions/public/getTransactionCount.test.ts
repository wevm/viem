import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import type { Hex } from 'viem/utils'

const address = '0x0000000000000000000000000000000000000105'

describe('getTransactionCount', () => {
  test('behavior: returns the transaction count for an address', async () => {
    await request(anvilMainnet, 'anvil_setNonce', [address, '0x2a'])
    await request(anvilMainnet, 'evm_mine')

    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const blockHash = await getLatestBlockHash()
    const blockNumber = await actions.public.getBlockNumber(client, {
      cacheTime: 0,
    })

    expect({
      blockHash: await actions.public.getTransactionCount(client, {
        address,
        blockHash,
      }),
      blockHashCanonical: await actions.public.getTransactionCount(client, {
        address,
        blockHash,
        requireCanonical: true,
      }),
      blockNumber: await actions.public.getTransactionCount(client, {
        address,
        blockNumber,
      }),
      latest: await actions.public.getTransactionCount(client, { address }),
    }).toMatchInlineSnapshot(`
      {
        "blockHash": 42n,
        "blockHashCanonical": 42n,
        "blockNumber": 42n,
        "latest": 42n,
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
