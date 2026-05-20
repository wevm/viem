import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'

describe('getBlock', () => {
  test('behavior: returns the latest block by default', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const block = await actions.getBlock(client)

    expect({
      hash: typeof block.hash,
      number: typeof block.number,
      transactions: block.transactions.every((transaction) =>
        Hex.validate(transaction),
      ),
    }).toMatchInlineSnapshot(`
      {
        "hash": "string",
        "number": "bigint",
        "transactions": true,
      }
    `)
  })

  test('behavior: uses the client block tag by default', async () => {
    const client = Client.create({
      blockTag: 'earliest',
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const block = await actions.getBlock(client)

    expect(block.number).toMatchInlineSnapshot(`0n`)
  })

  test('behavior: returns a block by number and hash', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const latest = await request<{ hash: Hex.Hex; number: Hex.Hex }>(
      anvilMainnet,
      'eth_getBlockByNumber',
      ['latest', false],
    )
    const blockNumber = Hex.toBigInt(latest.number)

    const byNumber = await actions.getBlock(client, { blockNumber })
    const byHash = await actions.getBlock(client, {
      blockHash: latest.hash,
    })

    expect({
      byHash: byHash.hash,
      byNumber: byNumber.hash,
      latest: latest.hash,
    }).toMatchObject({
      byHash: latest.hash,
      byNumber: latest.hash,
      latest: latest.hash,
    })
  })

  test('behavior: returns transaction objects when requested', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const receipt = await mineTransaction()

    const block = await actions.getBlock(client, {
      blockHash: receipt.blockHash,
      includeTransactions: true,
    })
    const transaction = block.transactions[0]

    expect({
      transactionCount: block.transactions.length,
      transactionHash: transaction?.hash,
      transactionValue: transaction?.value,
    }).toMatchObject({
      transactionCount: 1,
      transactionHash: receipt.transactionHash,
      transactionValue: 1n,
    })
  })

  test('behavior: throws when the block is not found', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await expect(
      actions.getBlock(client, {
        blockNumber: 999_999_999_999n,
      }),
    ).rejects.toMatchObject({ name: 'actions.public.BlockNotFoundError' })
    await expect(
      actions.getBlock(client, {
        blockHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      }),
    ).rejects.toMatchObject({ name: 'actions.public.BlockNotFoundError' })
  })
})

async function mineTransaction() {
  const [from, to] = await request<readonly Hex.Hex[]>(
    anvilMainnet,
    'eth_accounts',
  )
  const transactionHash = await request<Hex.Hex>(
    anvilMainnet,
    'eth_sendTransaction',
    [{ from, gas: '0x5208', to, value: '0x1' }],
  )
  const receipt = await request<{
    blockHash: Hex.Hex
    blockNumber: Hex.Hex
  }>(anvilMainnet, 'eth_getTransactionReceipt', [transactionHash])
  return { ...receipt, transactionHash }
}
