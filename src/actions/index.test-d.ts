import { describe, expectTypeOf, test } from 'vp/test'

import {
  Chain,
  Client,
  http,
  publicActions,
  testActions,
  type Account,
} from 'viem'
import * as actions from 'viem/actions'
import type { PublicActions, TestActions } from 'viem/actions'
import type { Block, Hex } from 'viem/utils'

const address = '0x0000000000000000000000000000000000000000'
const blockHash =
  '0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894' as Hex.Hex
const slot = '0x0'
const chain = Chain.define({
  id: 1n,
  name: 'Test',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://example.com'] } },
})

describe('public', () => {
  test('types: exposes standalone actions', async () => {
    const client = Client.create({
      transport: http(),
    })

    const balance = await actions.getBalance(client, { address })
    const blobBaseFee = await actions.getBlobBaseFee(client)
    const chainId = await actions.getChainId(client)
    const code = await actions.getCode(client, { address })
    const gasPrice = await actions.getGasPrice(client)
    const block = await actions.getBlock(client)
    const blockWithTransactions = await actions.getBlock(client, {
      includeTransactions: true,
    })
    const pendingBlock = await actions.getBlock(client, {
      blockTag: 'pending',
      includeTransactions: true,
    })
    const blockNumber = await actions.getBlockNumber(client)
    const blockTransactionCount = await actions.getBlockTransactionCount(client)
    const storage = await actions.getStorageAt(client, { address, slot })
    const transactionCount = await actions.getTransactionCount(client, {
      address,
    })
    const balanceByBlockHash = await actions.getBalance(client, {
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
    }).extend(publicActions())

    expectTypeOf(client.public).toEqualTypeOf<PublicActions>()

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
      chain,
      transport: http(),
    }).extend(actions.publicActions())

    const chainId = await client.public.getChainId()
    const blockNumber = await actions.getBlockNumber(client)

    expectTypeOf(client.account).toEqualTypeOf<
      Account.JsonRpc<typeof address>
    >()
    expectTypeOf(client.chain).toEqualTypeOf<typeof chain>()
    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
  })
})

describe('test', () => {
  test('types: exposes standalone actions', async () => {
    const client = Client.create({
      transport: http(),
    })

    const mine = actions.mine(client, {
      blocks: 1n,
      interval: 1,
      mode: 'hardhat',
    })
    const revert = actions.revert(client, { id: '0x1' })
    const setBalance = actions.setBalance(client, {
      address,
      mode: 'ganache',
      value: 1n,
    })
    const setCode = actions.setCode(client, {
      address,
      bytecode: '0x',
    })
    const setNonce = actions.setNonce(client, {
      address,
      mode: 'anvil',
      nonce: '0x1',
    })
    const setStorageAt = actions.setStorageAt(client, {
      address,
      slot: 0,
      value:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    })
    const snapshot = actions.snapshot(client)

    expectTypeOf({
      mine,
      revert,
      setBalance,
      setCode,
      setNonce,
      setStorageAt,
    }).toEqualTypeOf<{
      mine: Promise<void>
      revert: Promise<void>
      setBalance: Promise<void>
      setCode: Promise<void>
      setNonce: Promise<void>
      setStorageAt: Promise<void>
    }>()
    expectTypeOf(snapshot).toEqualTypeOf<Promise<Hex.Hex>>()
  })

  test('types: decorates clients with nested actions', async () => {
    const client = Client.create({
      account: address,
      chain,
      transport: http(),
    }).extend(testActions({ mode: 'ganache' }))

    const clientTest = client.test
    expectTypeOf(clientTest).toEqualTypeOf<TestActions>()
    expectTypeOf(client.account).toEqualTypeOf<
      Account.JsonRpc<typeof address>
    >()
    expectTypeOf(client.chain).toEqualTypeOf<typeof chain>()

    const mine = clientTest.mine({ blocks: 1n, interval: '0x1' })
    const revert = clientTest.revert({ id: 1n })
    const setBalance = clientTest.setBalance({ address, value: 1 })
    const setCode = clientTest.setCode({ address, bytecode: '0x' })
    const setNonce = clientTest.setNonce({ address, nonce: 1n })
    const setStorageAt = clientTest.setStorageAt({
      address,
      slot: '0x0',
      value:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    })
    const snapshot = clientTest.snapshot()

    expectTypeOf({
      mine,
      revert,
      setBalance,
      setCode,
      setNonce,
      setStorageAt,
    }).toEqualTypeOf<{
      mine: Promise<void>
      revert: Promise<void>
      setBalance: Promise<void>
      setCode: Promise<void>
      setNonce: Promise<void>
      setStorageAt: Promise<void>
    }>()
    expectTypeOf(snapshot).toEqualTypeOf<Promise<Hex.Hex>>()
  })
})
