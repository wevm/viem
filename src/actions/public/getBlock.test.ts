import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getBlock', () => {
  test('behavior: returns the latest block by default', async () => {
    const client = anvil.getClient(anvilMainnet)

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
    const client = anvil.getClient(anvilMainnet, { blockTag: 'earliest' })

    const block = await actions.getBlock(client)

    expect(block.number).toMatchInlineSnapshot(`0n`)
  })

  test('behavior: returns a block by number and hash', async () => {
    const client = anvil.getClient(anvilMainnet)
    const latest = await actions.getBlock(client)

    const byNumber = await actions.getBlock(client, {
      blockNumber: latest.number,
    })
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
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)
    const receipt = await actions.getTransactionReceipt(client, {
      hash: transactionHash,
    })

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
    const client = anvil.getClient(anvilMainnet)

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

async function mineTransaction(
  client: ReturnType<typeof anvil.getClient>,
): Promise<Hex.Hex> {
  // Wallet actions (`eth_accounts`, `eth_sendTransaction`) aren't wired up
  // yet; fall through to the client's RPC layer until `actions.wallet` lands.
  const [from, to] = await client.request({ method: 'eth_accounts' })
  return client.request({
    method: 'eth_sendTransaction',
    params: [{ from, gas: '0x5208', to, value: '0x1' }],
  })
}
