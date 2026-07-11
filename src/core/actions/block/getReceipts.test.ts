import { TransactionReceipt } from 'ox'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getReceipt } from '../transaction/getReceipt.js'

const client = anvil.getClient(anvil.mainnet)

// The pinned fork-tip block. anvil caches it, so its receipts are deterministic
// and independent of the upstream.
const blockNumber = anvil.mainnet.forkBlockNumber
const blockHash =
  '0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50'
const firstTransactionHash =
  '0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836'

test('args: blockNumber', async () => {
  const receipts = await Actions.block.getReceipts(client, { blockNumber })
  expect(receipts).toHaveLength(232)
  expect(receipts[0]).toEqual(
    await getReceipt(client, { hash: firstTransactionHash }),
  )
})

test('args: blockHash', async () => {
  const receipts = await Actions.block.getReceipts(client, { blockHash })
  expect(receipts).toHaveLength(232)
  expect(receipts[0]).toEqual(
    await getReceipt(client, { hash: firstTransactionHash }),
  )
})

test('args: blockTag (default latest)', async () => {
  const receipts = await Actions.block.getReceipts(client)
  expect(receipts).toHaveLength(232)
})

test('behavior: converts via chain schema when declared', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      transactionReceipt: {
        fromRpc: (rpc: TransactionReceipt.Rpc) =>
          TransactionReceipt.fromRpc(rpc),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  expect(
    await Actions.block.getReceipts(schemaClient, { blockNumber }),
  ).toEqual(await Actions.block.getReceipts(client, { blockNumber }))
})

test('behavior: converts custom properties via chain schema', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      transactionReceipt: {
        fromRpc: (rpc: TransactionReceipt.Rpc) => ({
          ...TransactionReceipt.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const receipts = await Actions.block.getReceipts(schemaClient, {
    blockNumber,
  })
  expect(receipts[0]!.custom).toBe('hello')
})

test('error: block not found', async () => {
  await expect(() =>
    Actions.block.getReceipts(client, { blockNumber: 99999999999n }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Block.NotFoundError: Block at number "99999999999" could not be found.

      Version: viem@2.52.1]
    `)
})
