import { describe, expectTypeOf, test } from 'vp/test'

import { Client, http } from '../index.js'
import * as actions from './index.js'
import * as actionsSubpath from 'viem/actions'

const address = '0x0000000000000000000000000000000000000000'

describe('public', () => {
  test('types: is exposed from the actions subpath', () => {
    expectTypeOf(actions.public).toEqualTypeOf<typeof actionsSubpath.public>()
  })

  test('types: exposes standalone actions', async () => {
    const client = Client.create({
      transport: http(),
    })

    const chainId = await actions.public.getChainId(client)
    const blockNumber = await actions.public.getBlockNumber(client)

    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
  })

  test('types: decorates clients with nested actions', async () => {
    const client = Client.create({
      transport: http(),
    }).extend(actions.public())

    const chainId = await client.public.getChainId()
    const blockNumber = await client.public.getBlockNumber()

    expectTypeOf(chainId).toEqualTypeOf<bigint>()
    expectTypeOf(blockNumber).toEqualTypeOf<bigint>()
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
