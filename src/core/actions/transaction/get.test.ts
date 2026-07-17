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
    '0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50',
  hash: '0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836',
} as const

test('args: hash', async () => {
  const { blockTimestamp: _blockTimestamp, ...transaction } =
    await Actions.transaction.get(client, {
      hash: forkTip.hash,
    })
  expect(transaction).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blobVersionedHashes": [
        "0x01637b24589ef367eaac307125f539f42cc84ca482d6c5f309698532c8a2d9d7",
        "0x01244879be004a8d2180995d74c273e8c2b1edcd283620308015ffa774c1d1d7",
        "0x01a426abdef2a217bd940077a2559b4eee7d9b98ce7c2f183a83d0c9564e0867",
      ],
      "blockHash": "0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50",
      "blockNumber": 24000000n,
      "chainId": 1,
      "data": "0x",
      "from": "0x5050f69a9786f081509234f1a7f4684b5e5b76c9",
      "gas": 21000n,
      "gasPrice": 10030101622n,
      "hash": "0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836",
      "input": "0x",
      "maxFeePerBlobGas": 1000000000n,
      "maxFeePerGas": 30030000000n,
      "maxPriorityFeePerGas": 10010000000n,
      "nonce": 1846289n,
      "r": "0xcca4472fa8fc4b09e23098d51d8ffd8c6c6b5924c11c22c60e319c3e90e97434",
      "s": "0x025948b75cb749fe6e8ce13d10575e3a1e18d31c849d808e3d23263ea9e71021",
      "to": "0xff00000000000000000000000000000000008453",
      "transactionIndex": 0,
      "type": "eip4844",
      "v": 27,
      "value": 0n,
      "yParity": 0,
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
  await Actions.block.mine(client, { blocks: 1 })

  const byHash = await Actions.transaction.get(client, { hash })
  const transaction = await Actions.transaction.get(client, {
    blockNumber: byHash.blockNumber!,
    index: byHash.transactionIndex!,
  })
  expect(transaction).toEqual(byHash)
})

test('behavior: converts via chain codecs when declared', async () => {
  const chain = mainnet.extend({
    rpcUrls: { http: anvil.mainnet.rpcUrl.http },
    codecs: {
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
      "blobVersionedHashes": [
        "0x01637b24589ef367eaac307125f539f42cc84ca482d6c5f309698532c8a2d9d7",
        "0x01244879be004a8d2180995d74c273e8c2b1edcd283620308015ffa774c1d1d7",
        "0x01a426abdef2a217bd940077a2559b4eee7d9b98ce7c2f183a83d0c9564e0867",
      ],
      "blockHash": "0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50",
      "blockNumber": 24000000n,
      "chainId": 1,
      "data": "0x",
      "from": "0x5050f69a9786f081509234f1a7f4684b5e5b76c9",
      "gas": 21000n,
      "gasPrice": 10030101622n,
      "hash": "0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836",
      "input": "0x",
      "maxFeePerBlobGas": 1000000000n,
      "maxFeePerGas": 30030000000n,
      "maxPriorityFeePerGas": 10010000000n,
      "nonce": 1846289n,
      "r": "0xcca4472fa8fc4b09e23098d51d8ffd8c6c6b5924c11c22c60e319c3e90e97434",
      "s": "0x025948b75cb749fe6e8ce13d10575e3a1e18d31c849d808e3d23263ea9e71021",
      "to": "0xff00000000000000000000000000000000008453",
      "transactionIndex": 0,
      "type": "eip4844",
      "v": 27,
      "value": 0n,
      "yParity": 0,
    }
  `)
})

test('behavior: converts custom properties via chain codecs', async () => {
  const chain = mainnet.extend({
    rpcUrls: { http: anvil.mainnet.rpcUrl.http },
    codecs: {
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
    [Transaction.NotFoundError: Transaction at block number "24000000" at index "9999999" could not be found.

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
    [Transaction.NotFoundError: Transaction at block hash "0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50" at index "9999999" could not be found.

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
