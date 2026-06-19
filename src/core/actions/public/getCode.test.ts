import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getCode } from './getCode.js'

const client = getClient(anvilMainnet)

// wagmi ERC-721 contract on mainnet.
const wagmi = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

describe('getCode', () => {
  test('default', async () => {
    expect(
      await getCode(client, {
        address: '0x0000000000000000000000000000000000000000',
      }),
    ).toBeUndefined()
    expect(await getCode(client, { address: wagmi })).toMatch(/^0x60/)
  })

  test('args: blockNumber', async () => {
    expect(
      await getCode(client, {
        address: wagmi,
        blockNumber: anvilMainnet.forkBlockNumber,
      }),
    ).toBeDefined()
  })

  test('args: blockHash (EIP-1898)', async () => {
    // TODO: replace with `getBlock` action when ported.
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    expect(
      await getCode(client, {
        address: wagmi,
        blockHash: block!.hash!,
        requireCanonical: true,
      }),
    ).toBeDefined()
  })
})
