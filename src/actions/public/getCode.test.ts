import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

const address = '0x0000000000000000000000000000000000000102'
const emptyAddress = '0x0000000000000000000000000000000000000103'
const code = '0x6001600055'

describe('getCode', () => {
  test('behavior: returns bytecode for an address', async () => {
    const client = anvil.getClient(anvilMainnet)

    await actions.setCode(client, { address, bytecode: code })
    await actions.mine(client, { blocks: 1n })

    const { hash: blockHash } = await actions.getBlock(client)
    const blockNumber = await actions.getBlockNumber(client, {
      cacheTime: 0,
    })

    expect({
      blockHash: await actions.getCode(client, { address, blockHash }),
      blockHashCanonical: await actions.getCode(client, {
        address,
        blockHash,
        requireCanonical: true,
      }),
      blockNumber: await actions.getCode(client, {
        address,
        blockNumber,
      }),
      latest: await actions.getCode(client, { address }),
      missing: await actions.getCode(client, { address: emptyAddress }),
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
