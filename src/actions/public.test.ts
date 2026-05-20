import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'

const address = '0x0000000000000000000000000000000000000001'
const code = '0x6001600055'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('public', () => {
  test('behavior: exposes action functions', () => {
    expect({
      getBalance: typeof actions.getBalance,
      getBlobBaseFee: typeof actions.getBlobBaseFee,
      getBlock: typeof actions.getBlock,
      getBlockNumber: typeof actions.getBlockNumber,
      getBlockTransactionCount: typeof actions.getBlockTransactionCount,
      getChainId: typeof actions.getChainId,
      getCode: typeof actions.getCode,
      getGasPrice: typeof actions.getGasPrice,
      getStorageAt: typeof actions.getStorageAt,
      getTransaction: typeof actions.getTransaction,
      getTransactionConfirmations: typeof actions.getTransactionConfirmations,
      getTransactionCount: typeof actions.getTransactionCount,
      getTransactionReceipt: typeof actions.getTransactionReceipt,
      publicActions: typeof actions.publicActions,
    }).toMatchInlineSnapshot(`
      {
        "getBalance": "function",
        "getBlobBaseFee": "function",
        "getBlock": "function",
        "getBlockNumber": "function",
        "getBlockTransactionCount": "function",
        "getChainId": "function",
        "getCode": "function",
        "getGasPrice": "function",
        "getStorageAt": "function",
        "getTransaction": "function",
        "getTransactionConfirmations": "function",
        "getTransactionCount": "function",
        "getTransactionReceipt": "function",
        "publicActions": "function",
      }
    `)
  })

  test('behavior: decorates clients with public actions', async () => {
    const client = Client.create({
      chain: anvilMainnet.chain,
      transport: http(anvilMainnet.rpcUrl.http),
    })
      .extend(actions.publicActions())
      .extend(actions.testActions())

    await client.test.setBalance({ address, value: 42n })
    await client.test.setCode({ address, bytecode: code })
    await client.test.setNonce({ address, nonce: 42n })
    await client.test.setStorageAt({ address, slot, value })

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

  test('behavior: decorates transaction read methods', async () => {
    const client = Client.create({
      chain: anvilMainnet.chain,
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())

    const [from, to] = await request<readonly Hex.Hex[]>(
      anvilMainnet,
      'eth_accounts',
    )
    const hash = await request<Hex.Hex>(anvilMainnet, 'eth_sendTransaction', [
      { from, gas: '0x5208', to, value: '0x1' },
    ])
    await request(anvilMainnet, 'anvil_mine', ['0x1'])

    const transaction = await client.public.getTransaction({ hash })
    const receipt = await client.public.getTransactionReceipt({ hash })
    const confirmations = await client.public.getTransactionConfirmations({
      hash,
    })

    expect({
      hash: transaction.hash,
      receiptStatus: receipt.status,
      confirmations: confirmations >= 1n,
    }).toMatchObject({
      hash,
      receiptStatus: 'success',
      confirmations: true,
    })
  })
})
