import { Transaction } from 'ox'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)

// The first transaction of the pinned fork-tip block. anvil caches the fork
// block, so these lookups are deterministic. `blockTimestamp` is omitted:
// its presence depends on the upstream node implementation.
const forkTip = {
  blockHash:
    '0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d',
  hash: '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926',
} as const

test('args: hash', async () => {
  const { blockTimestamp: _blockTimestamp, ...transaction } =
    await Actions.transaction.get(client, {
      hash: forkTip.hash,
    })
  expect(transaction).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
      "blockNumber": 22263623n,
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
  const transaction = await Actions.transaction.get(client, {
    blockHash: forkTip.blockHash,
    index: 0,
  })
  expect(transaction).toEqual(
    await Actions.transaction.get(client, { hash: forkTip.hash }),
  )
})

test('args: blockNumber + index', async () => {
  // The fork-tip block cannot be queried by number/index, so mine a local
  // block to exercise the success path.
  const hash = await Actions.transaction.send(client, {
    account: constants.accounts[0].address,
    to: constants.accounts[1].address,
    value: 1_000_000_000_000_000_000n,
  })
  await Actions.test.block.mine(client, { blocks: 1 })

  const byHash = await Actions.transaction.get(client, { hash })
  const transaction = await Actions.transaction.get(client, {
    blockNumber: byHash.blockNumber!,
    index: byHash.transactionIndex!,
  })
  expect(transaction).toEqual(byHash)
})

test('behavior: converts via chain schema when declared', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      transaction: {
        fromRpc: (rpc: Transaction.Rpc) => Transaction.fromRpc(rpc),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const { blockTimestamp: _blockTimestamp, ...transaction } =
    await Actions.transaction.get(schemaClient, {
      hash: forkTip.hash,
    })
  expect(transaction).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
      "blockNumber": 22263623n,
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

test('behavior: converts custom properties via chain schema', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      transaction: {
        fromRpc: (rpc: Transaction.Rpc) => ({
          ...Transaction.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const transaction = await Actions.transaction.get(schemaClient, {
    hash: forkTip.hash,
  })
  expect(transaction.custom).toBe('hello')
  expect(transaction.hash).toBe(forkTip.hash)
})

test('error: transaction not found (by hash)', async () => {
  await expect(() =>
    Actions.transaction.get(client, {
      hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction with hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found.

      Version: viem@2.52.1]
    `)
})

test('error: transaction not found (by block number + index)', async () => {
  await expect(() =>
    Actions.transaction.get(client, {
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
    Actions.transaction.get(client, { blockTag: 'latest', index: 9_999_999 }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction at block time "latest" at index "9999999" could not be found.

      Version: viem@2.52.1]
    `)
})

test('error: transaction not found (by block hash + index)', async () => {
  await expect(() =>
    Actions.transaction.get(client, {
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
    Actions.transaction.get(client, {
      sender: '0x000000000000000000000000000000000000dEaD',
      nonce: 9_999_999,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction could not be found.

      Version: viem@2.52.1]
    `)
})
