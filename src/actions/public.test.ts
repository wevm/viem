import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'

const address = '0x0000000000000000000000000000000000000001'
const code = '0x6001600055'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('public', () => {
  test('behavior: exposes action functions', () => {
    expect(Object.keys(actions.public).sort()).toMatchInlineSnapshot(`
      [
        "getBalance",
        "getBlobBaseFee",
        "getBlock",
        "getBlockNumber",
        "getBlockTransactionCount",
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
    }).extend(actions.public())

    await expect(client.public.getChainId()).resolves.toMatchInlineSnapshot(
      `31337n`,
    )
    const block = await client.public.getBlock()
    const blockNumber = await client.public.getBlockNumber()
    const blockTransactionCount = await client.public.getBlockTransactionCount()
    const gasPrice = await client.public.getGasPrice()
    const blobBaseFee = await client.public.getBlobBaseFee()

    expect({
      balance: await client.public.getBalance({ address }),
      blobBaseFee: typeof blobBaseFee,
      block: typeof block.hash,
      blockNumber: typeof blockNumber,
      blockTransactionCount: typeof blockTransactionCount,
      code: await client.public.getCode({ address }),
      gasPrice: typeof gasPrice,
      storage: await client.public.getStorageAt({ address, slot }),
      transactionCount: await client.public.getTransactionCount({ address }),
    }).toMatchInlineSnapshot(`
      {
        "balance": 42n,
        "blobBaseFee": "bigint",
        "block": "string",
        "blockNumber": "bigint",
        "blockTransactionCount": "bigint",
        "code": "0x6001600055",
        "gasPrice": "bigint",
        "storage": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "transactionCount": 42n,
      }
    `)
  })
})
