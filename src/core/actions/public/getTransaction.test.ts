import { z } from 'ox/zod'
import { Actions, Chain, Client, http } from 'viem'
import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

import { getTransaction } from './getTransaction.js'

const client = anvil.getClient(anvil.mainnet)

// The first transaction of the pinned fork-tip block. anvil caches the fork
// block, so these lookups are deterministic and do not depend on the upstream.
const forkTip = {
  blockHash:
    '0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d',
  hash: '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926',
} as const

describe('getTransaction', () => {
  test('args: hash', async () => {
    const transaction = await getTransaction(client, { hash: forkTip.hash })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
        "blockNumber": 22263623n,
        "blockTimestamp": 1744590299n,
        "chainId": 1,
        "data": "0x380db829",
        "from": "0xe2da046340e00264c4f0443243a0565007ae08ac",
        "gas": 2000000n,
        "gasPrice": 13319389978n,
        "hash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
        "input": "0x380db829",
        "maxFeePerGas": 13319389978n,
        "maxPriorityFeePerGas": 12683711234n,
        "nonce": 13314n,
        "r": "0xc266bb09b052429bff556bf3d29249c71286851267246acb2d47a8f33502850c",
        "s": "0x5c9715330193048ba9be906ccbbe2ef4c58eb3cdd25f21a2cad243a48371a931",
        "to": "0x39b7f514c199e4beb1739576a2dbd4de7414981b",
        "transactionIndex": 0,
        "type": "eip1559",
        "v": 28,
        "value": 0n,
        "yParity": 1,
      }
    `)
  })

  test('args: blockHash + index', async () => {
    const transaction = await getTransaction(client, {
      blockHash: forkTip.blockHash,
      index: 0,
    })
    expect(transaction).toEqual(
      await getTransaction(client, { hash: forkTip.hash }),
    )
  })

  test('args: blockNumber + index', async () => {
    // The fork-tip block cannot be queried by number/index, so mine a local
    // block to exercise the success path.
    // TODO: replace raw `eth_sendTransaction` with `sendTransaction` wallet
    // action once it lands.
    const hash = (await client.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: constants.accounts[0].address,
          to: constants.accounts[1].address,
          value: '0xde0b6b3a7640000',
        },
      ],
    } as never)) as `0x${string}`
    await Actions.test.mine(client, { blocks: 1 })

    const byHash = await getTransaction(client, { hash })
    const transaction = await getTransaction(client, {
      blockNumber: byHash.blockNumber!,
      index: byHash.transactionIndex!,
    })
    expect(transaction).toEqual(byHash)
  })

  test('behavior: decodes via chain schema when declared', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      schema: { transaction: { fromRpc: z.Transaction.Transaction } },
    })
    const schemaClient = Client.create({ chain, transport: http() })

    const transaction = await getTransaction(schemaClient, {
      hash: forkTip.hash,
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
        "blockNumber": 22263623n,
        "blockTimestamp": 1744590299n,
        "chainId": 1,
        "from": "0xe2da046340e00264c4f0443243a0565007ae08ac",
        "gas": 2000000n,
        "gasPrice": 13319389978n,
        "hash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
        "input": "0x380db829",
        "maxFeePerGas": 13319389978n,
        "maxPriorityFeePerGas": 12683711234n,
        "nonce": 13314n,
        "r": "0xc266bb09b052429bff556bf3d29249c71286851267246acb2d47a8f33502850c",
        "s": "0x5c9715330193048ba9be906ccbbe2ef4c58eb3cdd25f21a2cad243a48371a931",
        "to": "0x39b7f514c199e4beb1739576a2dbd4de7414981b",
        "transactionIndex": 0,
        "type": "eip1559",
        "v": 1,
        "value": 0n,
        "yParity": 1,
      }
    `)
  })

  test('behavior: decodes custom properties via chain schema', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      schema: {
        transaction: {
          fromRpc: z.pipe(
            z.Transaction.Transaction,
            z.transform((transaction) => ({
              ...transaction,
              custom: 'hello' as const,
            })),
          ),
        },
      },
    })
    const schemaClient = Client.create({ chain, transport: http() })

    const transaction = await getTransaction(schemaClient, {
      hash: forkTip.hash,
    })
    expect(transaction.custom).toBe('hello')
    expect(transaction.hash).toBe(forkTip.hash)
  })

  test('error: transaction not found (by hash)', async () => {
    await expect(() =>
      getTransaction(client, {
        hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction with hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found.

      Version: viem@2.52.1]
    `)
  })

  test('error: transaction not found (by block number + index)', async () => {
    await expect(() =>
      getTransaction(client, {
        blockNumber: anvil.mainnet.forkBlockNumber,
        index: 9_999_999,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction at block number "22263623" at index "9999999" could not be found.

      Version: viem@2.52.1]
    `)
  })

  test('error: transaction not found (by block tag + index)', async () => {
    await expect(() =>
      getTransaction(client, { blockTag: 'latest', index: 9_999_999 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction at block time "latest" at index "9999999" could not be found.

      Version: viem@2.52.1]
    `)
  })

  test('error: transaction not found (by block hash + index)', async () => {
    await expect(() =>
      getTransaction(client, {
        blockHash: forkTip.blockHash,
        index: 9_999_999,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction at block hash "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d" at index "9999999" could not be found.

      Version: viem@2.52.1]
    `)
  })

  test('error: transaction not found (by sender + nonce)', async () => {
    await expect(() =>
      getTransaction(client, {
        sender: '0x000000000000000000000000000000000000dEaD',
        nonce: 9_999_999,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction could not be found.

      Version: viem@2.52.1]
    `)
  })
})
