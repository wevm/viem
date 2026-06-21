import { z } from 'ox/zod'
import { Chain, Client, http } from 'viem'
import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getBlockReceipts } from './getBlockReceipts.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

const client = getClient(anvilMainnet)

// The pinned fork-tip block. anvil caches it, so its receipts are deterministic
// and independent of the upstream.
const blockNumber = anvilMainnet.forkBlockNumber
const blockHash =
  '0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d'
const firstTransactionHash =
  '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926'

describe('getBlockReceipts', () => {
  test('args: blockNumber', async () => {
    const receipts = await getBlockReceipts(client, { blockNumber })
    expect(receipts).toHaveLength(118)
    expect(receipts[0]).toEqual(
      await getTransactionReceipt(client, { hash: firstTransactionHash }),
    )
  })

  test('args: blockHash', async () => {
    const receipts = await getBlockReceipts(client, { blockHash })
    expect(receipts).toHaveLength(118)
    expect(receipts[0]).toEqual(
      await getTransactionReceipt(client, { hash: firstTransactionHash }),
    )
  })

  test('args: blockTag (default latest)', async () => {
    const receipts = await getBlockReceipts(client)
    expect(receipts).toHaveLength(118)
  })

  test('behavior: decodes via chain schema when declared', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvilMainnet.rpcUrl.http] } },
      schema: {
        transactionReceipt: {
          fromRpc: z.TransactionReceipt.TransactionReceipt,
        },
      },
    })
    const schemaClient = Client.create({ chain, transport: http() })

    expect(await getBlockReceipts(schemaClient, { blockNumber })).toEqual(
      await getBlockReceipts(client, { blockNumber }),
    )
  })

  test('behavior: decodes custom properties via chain schema', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvilMainnet.rpcUrl.http] } },
      schema: {
        transactionReceipt: {
          fromRpc: z.pipe(
            z.TransactionReceipt.TransactionReceipt,
            z.transform((receipt) => ({
              ...receipt,
              custom: 'hello' as const,
            })),
          ),
        },
      },
    })
    const schemaClient = Client.create({ chain, transport: http() })

    const receipts = await getBlockReceipts(schemaClient, { blockNumber })
    expect(receipts[0]!.custom).toBe('hello')
  })

  test('error: block not found', async () => {
    await expect(() => getBlockReceipts(client, { blockNumber: 99999999999n }))
      .rejects.toThrowErrorMatchingInlineSnapshot(`
      [Block.NotFoundError: Block at number "99999999999" could not be found.

      Version: viem@2.52.1]
    `)
  })
})
