import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { describe, expect, test } from 'vitest'

import { getStorageAt } from './getStorageAt.js'

const client = anvil.getClient(anvil.mainnet)

const { address, blockNumber } = await contract.deploy(client, {
  bytecode: generated.ERC721.bytecode.object,
})

describe('getStorageAt', () => {
  test('default', async () => {
    // slot 0 = `name` ("wagmi"), slot 1 = `symbol` ("WAGMI").
    expect(
      await getStorageAt(client, { address, slot: '0x0' }),
    ).toMatchInlineSnapshot(
      `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
    )
    expect(
      await getStorageAt(client, { address, slot: '0x1' }),
    ).toMatchInlineSnapshot(
      `"0x5741474d4900000000000000000000000000000000000000000000000000000a"`,
    )
  })

  test('args: blockNumber', async () => {
    expect(
      await getStorageAt(client, {
        address,
        slot: '0x0',
        blockNumber,
      }),
    ).toMatchInlineSnapshot(
      `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
    )
  })

  test('args: blockHash (EIP-1898)', async () => {
    // TODO: replace with `getBlock` action when ported.
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    expect(
      await getStorageAt(client, {
        address,
        slot: '0x0',
        blockHash: block!.hash!,
      }),
    ).toMatchInlineSnapshot(
      `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
    )
  })
})
