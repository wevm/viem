import { describe, expectTypeOf, test } from 'vp/test'

import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import type { Block, Hex } from 'viem/utils'

const address = '0x0000000000000000000000000000000000000000'
const blockHash =
  '0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894' as Hex.Hex
const slot = '0x0'

describe('public', () => {
  test('types: exposes standalone actions', async () => {
    const client = Client.create({
      transport: http(),
    })

    const balance = await actions.public.getBalance(client, { address })
    const blobBaseFee = await actions.public.getBlobBaseFee(client)
    const chainId = await actions.public.getChainId(client)
    const code = await actions.public.getCode(client, { address })
    const gasPrice = await actions.public.getGasPrice(client)
    const block = await actions.public.getBlock(client)
    const blockWithTransactions = await actions.public.getBlock(client, {
      includeTransactions: true,
    })
    const pendingBlock = await actions.public.getBlock(client, {
      blockTag: 'pending',
      includeTransactions: true,
    })
    const blockNumber = await actions.public.getBlockNumber(client)
    const blockTransactionCount =
      await actions.public.getBlockTransactionCount(client)
    const storage = await actions.public.getStorageAt(client, { address, slot })
    const transactionCount = await actions.public.getTransactionCount(client, {
      address,
    })
    const balanceByBlockHash = await actions.public.getBalance(client, {
      address,
      blockHash,
      requireCanonical: true,
    })

    expectTypeOf(balance).toEqualTypeOf<bigint>()
    expectTypeOf(balanceByBlockHash).toEqualTypeOf<bigint>()
    expectTypeOf(blobBaseFee).toEqualTypeOf<bigint>()
    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(code).toEqualTypeOf<Hex.Hex | undefined>()
    expectTypeOf(gasPrice).toEqualTypeOf<bigint>()
    expectTypeOf(block).toEqualTypeOf<Block.Block<false, 'latest'>>()
    expectTypeOf(blockWithTransactions).toEqualTypeOf<
      Block.Block<true, 'latest'>
    >()
    expectTypeOf(pendingBlock).toEqualTypeOf<Block.Block<true, 'pending'>>()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(blockTransactionCount).toEqualTypeOf<bigint>()
    expectTypeOf(storage).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(transactionCount).toEqualTypeOf<bigint>()
  })

  test('types: decorates clients with nested actions', async () => {
    const client = Client.create({
      transport: http(),
    }).extend(actions.public())

    const balance = await client.public.getBalance({ address })
    const blobBaseFee = await client.public.getBlobBaseFee()
    const chainId = await client.public.getChainId()
    const code = await client.public.getCode({ address })
    const gasPrice = await client.public.getGasPrice()
    const block = await client.public.getBlock()
    const blockWithTransactions = await client.public.getBlock({
      includeTransactions: true,
    })
    const blockNumber = await client.public.getBlockNumber()
    const blockTransactionCount = await client.public.getBlockTransactionCount()
    const storage = await client.public.getStorageAt({ address, slot })
    const transactionCount = await client.public.getTransactionCount({
      address,
    })
    const balanceByBlockHash = await client.public.getBalance({
      address,
      blockHash,
      requireCanonical: true,
    })

    expectTypeOf(balance).toEqualTypeOf<bigint>()
    expectTypeOf(balanceByBlockHash).toEqualTypeOf<bigint>()
    expectTypeOf(blobBaseFee).toEqualTypeOf<bigint>()
    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(code).toEqualTypeOf<Hex.Hex | undefined>()
    expectTypeOf(gasPrice).toEqualTypeOf<bigint>()
    expectTypeOf(block).toEqualTypeOf<Block.Block<false, 'latest'>>()
    expectTypeOf(blockWithTransactions).toEqualTypeOf<
      Block.Block<true, 'latest'>
    >()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(blockTransactionCount).toEqualTypeOf<bigint>()
    expectTypeOf(storage).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(transactionCount).toEqualTypeOf<bigint>()
  })

  test('types: accepts clients with accounts', async () => {
    const client = Client.create({
      account: address,
      transport: http(),
    }).extend(actions.public())

    const chainId = await client.public.getChainId()
    const blockNumber = await actions.public.getBlockNumber(client)

    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
  })
})
