import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getStorageAt } from './getStorageAt.js'

const client = getClient(anvilMainnet)

// wagmi ERC-721 contract on mainnet.
const wagmi = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

describe('getStorageAt', () => {
  test('default', async () => {
    expect(
      await getStorageAt(client, { address: wagmi, slot: '0x0' }),
    ).toMatchInlineSnapshot(
      `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
    )
    expect(
      await getStorageAt(client, { address: wagmi, slot: '0x1' }),
    ).toMatchInlineSnapshot(
      `"0x5741474d4900000000000000000000000000000000000000000000000000000a"`,
    )
  })

  test('args: blockNumber', async () => {
    expect(
      await getStorageAt(client, {
        address: wagmi,
        slot: '0x0',
        blockNumber: anvilMainnet.forkBlockNumber,
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
        address: wagmi,
        slot: '0x0',
        blockHash: block!.hash!,
      }),
    ).toMatchInlineSnapshot(
      `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
    )
  })
})
