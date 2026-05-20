import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../test/anvil.js'
import * as Client from '../core/Client.js'
import { http } from '../core/transports/index.js'
import { publicActions } from './public.js'

const address = '0x0000000000000000000000000000000000000001'
const code = '0x6001600055'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('public', () => {
  test('behavior: exposes action functions', () => {
    expect(Object.keys(publicActions).sort()).toMatchInlineSnapshot(`
      [
        "getBalance",
        "getBlobBaseFee",
        "getBlockNumber",
        "getChainId",
        "getCode",
        "getGasPrice",
        "getStorageAt",
        "getTransactionCount",
      ]
    `)
  })

  test('behavior: decorates clients with public actions', async () => {
    await request(anvilMainnet, 'anvil_setBalance', [address, '0x2a'])
    await request(anvilMainnet, 'anvil_setCode', [address, code])
    await request(anvilMainnet, 'anvil_setNonce', [address, '0x2a'])
    await request(anvilMainnet, 'anvil_setStorageAt', [address, slot, value])

    const client = Client.create({
      chain: anvilMainnet.chain,
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(publicActions())

    await expect(client.public.getChainId()).resolves.toMatchInlineSnapshot(
      `31337n`,
    )
    const blockNumber = await client.public.getBlockNumber()
    const gasPrice = await client.public.getGasPrice()
    const blobBaseFee = await client.public.getBlobBaseFee()

    expect({
      balance: await client.public.getBalance({ address }),
      blobBaseFee: typeof blobBaseFee,
      blockNumber: typeof blockNumber,
      code: await client.public.getCode({ address }),
      gasPrice: typeof gasPrice,
      storage: await client.public.getStorageAt({ address, slot }),
      transactionCount: await client.public.getTransactionCount({ address }),
    }).toMatchInlineSnapshot(`
      {
        "balance": 42n,
        "blobBaseFee": "bigint",
        "blockNumber": "bigint",
        "code": "0x6001600055",
        "gasPrice": "bigint",
        "storage": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "transactionCount": 42n,
      }
    `)
  })
})
