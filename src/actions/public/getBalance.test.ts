import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

const address = '0x0000000000000000000000000000000000000101'

describe('getBalance', () => {
  test('behavior: returns the balance for an address', async () => {
    const client = anvil.getClient(anvilMainnet)

    await actions.setBalance(client, { address, value: 42n })
    await actions.mine(client, { blocks: 1n })

    const { hash: blockHash } = await actions.getBlock(client)
    const blockNumber = await actions.getBlockNumber(client, {
      cacheTime: 0,
    })

    expect({
      blockHash: await actions.getBalance(client, {
        address,
        blockHash,
      }),
      blockHashCanonical: await actions.getBalance(client, {
        address,
        blockHash,
        requireCanonical: true,
      }),
      blockNumber: await actions.getBalance(client, {
        address,
        blockNumber,
      }),
      latest: await actions.getBalance(client, { address }),
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
