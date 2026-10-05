import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Client, http, testActions } from 'viem'

const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

test('request: typed against the test schema for the mode', async () => {
  const client = Client.create({ transport: http() }).extend(
    testActions({ mode: 'anvil' }),
  )

  const setBalance = await client.request({
    method: 'anvil_setBalance',
    params: [address, '0x1'],
  })
  expectTypeOf(setBalance).toEqualTypeOf<void>()

  const automine = await client.request({ method: 'anvil_getAutomine' })
  expectTypeOf(automine).toEqualTypeOf<boolean>()

  const snapshot = await client.request({ method: 'evm_snapshot' })
  expectTypeOf(snapshot).toEqualTypeOf<`0x${string}`>()

  const status = await client.request({ method: 'txpool_status' })
  expectTypeOf(status).toEqualTypeOf<{
    pending: `0x${string}`
    queued: `0x${string}`
  }>()

  const chainId = await client.request({ method: 'eth_chainId' })
  expectTypeOf(chainId).toEqualTypeOf<`0x${string}`>()

  // @ts-expect-error params are required
  client.request({ method: 'anvil_setBalance' })

  client.request({
    method: 'anvil_setBalance',
    // @ts-expect-error params must be [address, balance]
    params: [420],
  })
})

test('request: mode defaults to anvil', async () => {
  const client = Client.create({ transport: http() }).extend(testActions())
  const result = await client.request({
    method: 'anvil_setBalance',
    params: [address, '0x1'],
  })
  expectTypeOf(result).toEqualTypeOf<void>()
})

test('request: mode-prefixed methods follow the mode', async () => {
  const client = Client.create({ transport: http() }).extend(
    testActions({ mode: 'hardhat' }),
  )

  const setBalance = await client.request({
    method: 'hardhat_setBalance',
    params: [address, '0x1'],
  })
  expectTypeOf(setBalance).toEqualTypeOf<void>()

  const offSchema = await client.request({ method: 'anvil_setBalance' })
  expectTypeOf(offSchema).toEqualTypeOf<unknown>()
})

test('request: user-provided schemas still merge', async () => {
  const schema = z.RpcSchema.from({
    abe_foo: { params: z.tuple([z.number()]), returns: z.string() },
  })
  const client = Client.create({ transport: http(), schema }).extend(
    testActions({ mode: 'anvil' }),
  )

  const foo = await client.request({ method: 'abe_foo', params: [1] })
  expectTypeOf(foo).toEqualTypeOf<string>()

  const mine = await client.request({
    method: 'anvil_mine',
    params: ['0x1', undefined],
  })
  expectTypeOf(mine).toEqualTypeOf<void>()
})

test('request: the test schema survives subsequent extends', async () => {
  const client = Client.create({ transport: http() })
    .extend(testActions({ mode: 'anvil' }))
    .extend(() => ({ foo: () => 'foo' as const }))

  expectTypeOf(client.foo).toEqualTypeOf<() => 'foo'>()
  const result = await client.request({
    method: 'anvil_setBalance',
    params: [address, '0x1'],
  })
  expectTypeOf(result).toEqualTypeOf<void>()
})

test('request: non-test extensions leave the schema untouched', async () => {
  const client = Client.create({ transport: http() }).extend(() => ({
    foo: () => 'foo' as const,
  }))

  const chainId = await client.request({ method: 'eth_chainId' })
  expectTypeOf(chainId).toEqualTypeOf<`0x${string}`>()

  const offSchema = await client.request({ method: 'anvil_setBalance' })
  expectTypeOf(offSchema).toEqualTypeOf<unknown>()
})

test('extend: strips the schema marker from the client surface', () => {
  const client = Client.create({ transport: http() }).extend(
    testActions({ mode: 'anvil' }),
  )
  expectTypeOf(client.address.setBalance).toBeFunction()
  expectTypeOf<
    '~schema' extends keyof typeof client ? true : false
  >().toEqualTypeOf<false>()
})
