import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import * as Client from '../../core/Client.js'
import { http } from '../../core/transports/index.js'
import type * as Hex from '../../utils/Hex.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getCode } from './getCode.js'

const address = '0x0000000000000000000000000000000000000102'
const emptyAddress = '0x0000000000000000000000000000000000000103'
const code = '0x6001600055'

describe('getCode', () => {
  test('behavior: returns bytecode for an address', async () => {
    await request(anvilMainnet, 'anvil_setCode', [address, code])
    await request(anvilMainnet, 'evm_mine')

    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const blockHash = await getLatestBlockHash()
    const blockNumber = await getBlockNumber(client, { cacheTime: 0 })

    expect({
      blockHash: await getCode(client, { address, blockHash }),
      blockHashCanonical: await getCode(client, {
        address,
        blockHash,
        requireCanonical: true,
      }),
      blockNumber: await getCode(client, { address, blockNumber }),
      latest: await getCode(client, { address }),
      missing: await getCode(client, { address: emptyAddress }),
    }).toMatchInlineSnapshot(`
      {
        "blockHash": "0x6001600055",
        "blockHashCanonical": "0x6001600055",
        "blockNumber": "0x6001600055",
        "latest": "0x6001600055",
        "missing": undefined,
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
