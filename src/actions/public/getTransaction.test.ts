import { describe, expect, test } from 'vp/test'

import { Client, custom } from 'viem'
import * as actions from 'viem/actions'
import type { Hex } from 'viem/utils'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getTransaction', () => {
  test('behavior: fetches a transaction by hash', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)

    const transaction = await actions.getTransaction(client, {
      hash: transactionHash,
    })

    expect({
      hash: transaction.hash,
      type: transaction.type,
      value: transaction.value,
    }).toMatchObject({
      hash: transactionHash,
      type: 'eip1559',
      value: 1n,
    })
  })

  test('behavior: fetches a transaction by block hash and index', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)
    const receipt = await actions.getTransactionReceipt(client, {
      hash: transactionHash,
    })

    const transaction = await actions.getTransaction(client, {
      blockHash: receipt.blockHash,
      index: 0,
    })

    expect(transaction.hash).toBe(transactionHash)
  })

  test('behavior: fetches a transaction by block number and index', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)
    const receipt = await actions.getTransactionReceipt(client, {
      hash: transactionHash,
    })

    const transaction = await actions.getTransaction(client, {
      blockNumber: receipt.blockNumber,
      index: 0,
    })

    expect(transaction.hash).toBe(transactionHash)
  })

  test('behavior: fetches a transaction by block tag and index', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)

    const transaction = await actions.getTransaction(client, {
      blockTag: 'latest',
      index: 0,
    })

    expect(transaction.hash).toBe(transactionHash)
  })

  test('behavior: throws when the transaction is not found', async () => {
    const client = anvil.getClient(anvilMainnet)

    await expect(
      actions.getTransaction(client, {
        hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      }),
    ).rejects.toMatchObject({
      name: 'actions.public.TransactionNotFoundError',
      shortMessage:
        'Transaction with hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found.',
    })
  })

  test('behavior: throws not-found with block-hash identifier', async () => {
    const client = anvil.getClient(anvilMainnet)

    await expect(
      actions.getTransaction(client, {
        blockHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        index: 0,
      }),
    ).rejects.toMatchObject({
      name: 'actions.public.TransactionNotFoundError',
      shortMessage:
        'Transaction at block hash "0x0000000000000000000000000000000000000000000000000000000000000000" at index "0" could not be found.',
    })
  })

  test('behavior: throws not-found with block-number identifier', async () => {
    const client = anvil.getClient(anvilMainnet)

    await expect(
      actions.getTransaction(client, {
        blockNumber: 999_999_999_999n,
        index: 0,
      }),
    ).rejects.toMatchObject({
      name: 'actions.public.TransactionNotFoundError',
      shortMessage:
        'Transaction at block number "999999999999" at index "0" could not be found.',
    })
  })

  test('behavior: throws not-found with block-tag identifier', async () => {
    const client = anvil.getClient(anvilMainnet)

    await expect(
      actions.getTransaction(client, {
        blockTag: 'pending',
        index: 999,
      }),
    ).rejects.toMatchObject({
      name: 'actions.public.TransactionNotFoundError',
      shortMessage:
        'Transaction at block time "pending" at index "999" could not be found.',
    })
  })

  test('behavior: requests eth_getTransactionBySenderAndNonce', async () => {
    const requests: { method: string; params?: unknown }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
          return null
        },
      }),
    })

    await expect(
      actions.getTransaction(client, {
        sender: '0x0000000000000000000000000000000000000001',
        nonce: 5,
      }),
    ).rejects.toMatchObject({
      name: 'actions.public.TransactionNotFoundError',
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "eth_getTransactionBySenderAndNonce",
          "params": [
            "0x0000000000000000000000000000000000000001",
            "0x5",
          ],
        },
      ]
    `)
  })
})

async function mineTransaction(
  client: ReturnType<typeof anvil.getClient>,
): Promise<Hex.Hex> {
  // Wallet actions (`eth_accounts`, `eth_sendTransaction`) aren't wired up
  // yet; fall through to the client's RPC layer until `actions.wallet` lands.
  // Anvil auto-mines on transaction submission, so no explicit mine is needed.
  const [from, to] = await client.request({ method: 'eth_accounts' })
  return client.request({
    method: 'eth_sendTransaction',
    params: [{ from, gas: '0x5208', to, value: '0x1' }],
  })
}
