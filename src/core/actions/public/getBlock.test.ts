import { Chain, Client, http } from 'viem'
import { z } from 'ox/zod'
import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getBlock } from './getBlock.js'

const client = getClient(anvilMainnet)

describe('getBlock', () => {
  test('default', async () => {
    const block = await getBlock(client)
    expect(block.hash).toBeDefined()
    expect(block.nonce).toBeDefined()
    expect(block.number).toBe(anvilMainnet.forkBlockNumber)
    expect(typeof block.timestamp).toBe('bigint')
    expect(Array.isArray(block.transactions)).toBe(true)
    // schema-less default path returns transaction hashes.
    expect(typeof block.transactions[0]).toBe('string')
  })

  test('args: blockNumber', async () => {
    const block = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber - 100n,
    })
    expect(block.number).toBe(anvilMainnet.forkBlockNumber - 100n)
  })

  test('args: blockTag', async () => {
    const block = await getBlock(client, { blockTag: 'latest' })
    expect(block.number).toBe(anvilMainnet.forkBlockNumber)
  })

  test('args: blockHash', async () => {
    const { hash } = await getBlock(client)
    const block = await getBlock(client, { blockHash: hash! })
    expect(block.hash).toBe(hash)
    expect(block.number).toBe(anvilMainnet.forkBlockNumber)
  })

  test('args: includeTransactions', async () => {
    const block = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
      includeTransactions: true,
    })
    const transaction = block.transactions[0]
    expect(typeof transaction).toBe('object')
    expect(typeof transaction.hash).toBe('string')
    expect(typeof transaction.blockNumber).toBe('bigint')
  })

  test('behavior: decodes via chain schema when declared', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvilMainnet.rpcUrl.http] } },
      schema: { block: { fromRpc: z.Block.Block } },
    })
    const schemaClient = Client.create({ chain, transport: http() })

    const viaSchema = await getBlock(schemaClient, {
      blockNumber: anvilMainnet.forkBlockNumber,
    })
    const viaDefault = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
    })
    expect(viaSchema).toEqual(viaDefault)
  })

  test('behavior: decodes custom properties via chain schema', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvilMainnet.rpcUrl.http] } },
      schema: {
        block: {
          fromRpc: z.pipe(
            z.Block.Block,
            z.transform((block) => ({ ...block, custom: 'hello' as const })),
          ),
        },
      },
    })
    const schemaClient = Client.create({ chain, transport: http() })

    const block = await getBlock(schemaClient, {
      blockNumber: anvilMainnet.forkBlockNumber,
    })
    // custom property is decoded onto the result.
    expect(block.custom).toBe('hello')
    // standard properties still decode correctly.
    expect(block.number).toBe(anvilMainnet.forkBlockNumber)
  })

  test('error: block not found', async () => {
    await expect(() => getBlock(client, { blockNumber: 9_999_999_999n }))
      .rejects.toThrowErrorMatchingInlineSnapshot(`
      [Block.NotFoundError: Block at number "9999999999" could not be found.

      Version: viem@2.52.1]
    `)
  })

  test('error: block not found (by hash)', async () => {
    await expect(() =>
      getBlock(client, {
        blockHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Block.NotFoundError: Block at hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found.

      Version: viem@2.52.1]
    `)
  })
})
