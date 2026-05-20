import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

const address = '0x0000000000000000000000000000000000000105'

describe('getTransactionCount', () => {
  test('behavior: returns the transaction count for an address', async () => {
    const client = anvil.getClient(anvilMainnet)

    await actions.setNonce(client, { address, nonce: 42n })
    await actions.mine(client, { blocks: 1n })

    const { hash: blockHash } = await actions.getBlock(client)
    const blockNumber = await actions.getBlockNumber(client, {
      cacheTime: 0,
    })

    expect({
      blockHash: await actions.getTransactionCount(client, {
        address,
        blockHash,
      }),
      blockHashCanonical: await actions.getTransactionCount(client, {
        address,
        blockHash,
        requireCanonical: true,
      }),
      blockNumber: await actions.getTransactionCount(client, {
        address,
        blockNumber,
      }),
      latest: await actions.getTransactionCount(client, { address }),
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
