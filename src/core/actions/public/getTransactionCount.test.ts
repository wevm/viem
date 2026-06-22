import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getTransactionCount } from './getTransactionCount.js'

const client = anvil.getClient(anvil.mainnet)

describe('getTransactionCount', () => {
  test('default', async () => {
    expect(
      await getTransactionCount(client, {
        address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      }),
    ).toBeTypeOf('number')
  })

  test('args: blockNumber', async () => {
    expect(
      await getTransactionCount(client, {
        address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
        blockNumber: 14932234n,
      }),
    ).toBe(368)
  })

  test('args: blockTag', async () => {
    expect(
      await getTransactionCount(client, {
        address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
        blockTag: 'latest',
      }),
    ).toBeTypeOf('number')
  })

  test('behavior: no count', async () => {
    expect(
      await getTransactionCount(client, {
        address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ad',
      }),
    ).toBe(0)
  })

  test('args: blockHash (EIP-1898)', async () => {
    // TODO: replace with `getBlock` action when ported.
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    expect(
      await getTransactionCount(client, {
        address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
        blockHash: block!.hash!,
      }),
    ).toBeTypeOf('number')
  })
})
