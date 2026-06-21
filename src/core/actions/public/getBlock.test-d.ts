import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, publicActions } from 'viem'

import { getBlock } from './getBlock.js'

const client = Client.create({ transport: http() })

test('default: returns transaction hashes', async () => {
  const block = await getBlock(client)
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
  expectTypeOf(block.transactions).toEqualTypeOf<readonly Hex.Hex[]>()
})

test('includeTransactions: returns transaction objects', async () => {
  const block = await getBlock(client, { includeTransactions: true })
  expectTypeOf(block.transactions).not.toEqualTypeOf<readonly Hex.Hex[]>()
  expectTypeOf(block.transactions[0].hash).toEqualTypeOf<Hex.Hex>()
})

test('chain schema: returns z.output of the block codec', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: { block: { fromRpc: z.Block.Block } },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const block = await getBlock(schemaClient)
  expectTypeOf(block).toEqualTypeOf<z.output<typeof z.Block.Block>>()
})

test('chain schema: infers custom block properties', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: {
      block: {
        fromRpc: z.extend(z.Block.Block, {
          custom: z.optional(z.Hex.Hex),
          feeCurrency: z.nullable(z.Address.Address),
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const block = await getBlock(schemaClient)
  // custom properties are inferred onto the return type.
  expectTypeOf(block.custom).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(block.feeCurrency).toEqualTypeOf<Address.Address | null>()
  // standard properties are preserved alongside the custom ones.
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
  expectTypeOf(block.transactions).toEqualTypeOf<readonly Hex.Hex[]>()
})

test('chain schema: infers custom properties from a transform', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
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

  const block = await getBlock(schemaClient)
  expectTypeOf(block.custom).toEqualTypeOf<'hello'>()
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
})

test('decorator: threads custom chain properties through publicActions', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: {
      block: {
        fromRpc: z.extend(z.Block.Block, { custom: z.optional(z.Hex.Hex) }),
      },
    },
  })
  const decorated = Client.create({ chain, transport: http() }).extend(
    publicActions(),
  )

  const block = await decorated.getBlock()
  expectTypeOf(block.custom).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
})
