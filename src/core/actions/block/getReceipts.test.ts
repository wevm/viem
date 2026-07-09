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
  '0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d'
const firstTransactionHash =
  '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926'

test('args: blockNumber', async () => {
  const receipts = await Actions.block.getReceipts(client, { blockNumber })
  expect(receipts).toHaveLength(118)
  expect(receipts[0]).toEqual(
    await getReceipt(client, { hash: firstTransactionHash }),
  )
})

test('args: blockHash', async () => {
  const receipts = await Actions.block.getReceipts(client, { blockHash })
  expect(receipts).toHaveLength(118)
  expect(receipts[0]).toEqual(
    await getReceipt(client, { hash: firstTransactionHash }),
  )
})

test('args: blockTag (default latest)', async () => {
  const receipts = await Actions.block.getReceipts(client)
  expect(receipts).toHaveLength(118)
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
