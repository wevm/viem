import { describe, expectTypeOf, test } from 'vp/test'

import { Client, http } from '../index.js'
import type * as Hex from '../utils/Hex.js'
import * as actions from './index.js'
import * as actionsSubpath from 'viem/actions'

const address = '0x0000000000000000000000000000000000000000'
const slot = '0x0'

describe('public', () => {
  test('types: is exposed from the actions subpath', () => {
    expectTypeOf(actions.public).toEqualTypeOf<typeof actionsSubpath.public>()
  })

  test('types: exposes standalone actions', async () => {
    const client = Client.create({
      transport: http(),
    })

    const balance = await actions.public.getBalance(client, { address })
    const blobBaseFee = await actions.public.getBlobBaseFee(client)
    const chainId = await actions.public.getChainId(client)
    const code = await actions.public.getCode(client, { address })
    const gasPrice = await actions.public.getGasPrice(client)
    const blockNumber = await actions.public.getBlockNumber(client)
    const storage = await actions.public.getStorageAt(client, { address, slot })
    const transactionCount = await actions.public.getTransactionCount(client, {
      address,
    })

    expectTypeOf(balance).toEqualTypeOf<bigint>()
    expectTypeOf(blobBaseFee).toEqualTypeOf<bigint>()
    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(code).toEqualTypeOf<Hex.Hex | undefined>()
    expectTypeOf(gasPrice).toEqualTypeOf<bigint>()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
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
    const blockNumber = await client.public.getBlockNumber()
    const storage = await client.public.getStorageAt({ address, slot })
    const transactionCount = await client.public.getTransactionCount({
      address,
    })

    expectTypeOf(balance).toEqualTypeOf<bigint>()
    expectTypeOf(blobBaseFee).toEqualTypeOf<bigint>()
    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(code).toEqualTypeOf<Hex.Hex | undefined>()
    expectTypeOf(gasPrice).toEqualTypeOf<bigint>()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
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
