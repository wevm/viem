import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import * as Client from '../../core/Client.js'
import { http } from '../../core/transports/index.js'
import type * as Hex from '../../utils/Hex.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getTransactionCount } from './getTransactionCount.js'

const address = '0x0000000000000000000000000000000000000105'

describe('getTransactionCount', () => {
  test('behavior: returns the transaction count for an address', async () => {
    await request(anvilMainnet, 'anvil_setNonce', [address, '0x2a'])
    await request(anvilMainnet, 'evm_mine')

    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const blockHash = await getLatestBlockHash()
    const blockNumber = await getBlockNumber(client, { cacheTime: 0 })

    expect({
      blockHash: await getTransactionCount(client, { address, blockHash }),
      blockHashCanonical: await getTransactionCount(client, {
        address,
        blockHash,
        requireCanonical: true,
      }),
      blockNumber: await getTransactionCount(client, { address, blockNumber }),
      latest: await getTransactionCount(client, { address }),
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
