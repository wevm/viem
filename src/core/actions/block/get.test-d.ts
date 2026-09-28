import { Block, type Address, type Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http, publicActions } from 'viem'
const client = Client.create({ transport: http() })

test('default: returns transaction hashes', async () => {
  const block = await Actions.block.get(client)
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
  expectTypeOf(block.transactions).toEqualTypeOf<readonly Hex.Hex[]>()
})

test('includeTransactions: returns transaction objects', async () => {
  const block = await Actions.block.get(client, { includeTransactions: true })
  expectTypeOf(block.transactions).not.toEqualTypeOf<readonly Hex.Hex[]>()
  expectTypeOf(block.transactions[0]!.hash).toEqualTypeOf<Hex.Hex>()
})

test('chain codecs: returns the block converter output', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      block: {
        fromRpc: (rpc: Block.Rpc): Block.Block => Block.fromRpc(rpc),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const block = await Actions.block.get(schemaClient)
  expectTypeOf(block).toEqualTypeOf<Block.Block>()
})

test('chain codecs: infers custom block properties', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      block: {
        fromRpc: (
          rpc: Block.Rpc,
        ): Block.Block & {
          custom?: Hex.Hex | undefined
          feeCurrency: Address.Address | null
        } => ({
          ...Block.fromRpc(rpc),
          custom: undefined,
          feeCurrency: null,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const block = await Actions.block.get(schemaClient)
  // custom properties are inferred onto the return type.
  expectTypeOf(block.custom).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(block.feeCurrency).toEqualTypeOf<Address.Address | null>()
  // standard properties are preserved alongside the custom ones.
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
  expectTypeOf(block.transactions).toEqualTypeOf<readonly Hex.Hex[]>()
})

test('chain codecs: infers custom properties from a transform', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      block: {
        fromRpc: (rpc: Block.Rpc) => ({
          ...Block.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const block = await Actions.block.get(schemaClient)
  expectTypeOf(block.custom).toEqualTypeOf<'hello'>()
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
})

test('decorator: threads custom chain properties through publicActions', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      block: {
        fromRpc: (
          rpc: Block.Rpc,
        ): Block.Block & { custom?: Hex.Hex | undefined } => ({
          ...Block.fromRpc(rpc),
          custom: undefined,
        }),
      },
    },
  })
  const decorated = Client.create({ chain, transport: http() }).extend(
    publicActions(),
  )

  const block = await decorated.block.get()
  expectTypeOf(block.custom).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
})
