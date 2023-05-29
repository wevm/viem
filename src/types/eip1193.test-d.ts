import type {
  EIP1193RequestFn,
  PublicRpcSchema,
  TestRpcSchema,
  WalletRpcSchema,
} from './eip1193.js'
import type { Hash, Hex } from './misc.js'
import type { Quantity, RpcLog, RpcTransaction } from './rpc.js'
import type { Address } from 'abitype'
import { expectTypeOf, test } from 'vitest'

test('default', async () => {
  type Default = EIP1193RequestFn

  const request: Default = null as any

  const x = await request({ method: 'eth_wagmi' })
  expectTypeOf<typeof x>().toEqualTypeOf<unknown>()

  request({ method: 'eth_wagmi', params: undefined })
  request({ method: 'eth_wagmi', params: [] })
  request({ method: 'eth_wagmi', params: [{ foo: 'bar' }] })

  expectTypeOf<Parameters<Default>[0]>().toEqualTypeOf<
    { method: string } & ({ params: unknown } | { params?: unknown })
  >()
  expectTypeOf<ReturnType<Default>>().toEqualTypeOf<Promise<unknown>>()
})

test('public methods', async () => {
  type Public = EIP1193RequestFn<PublicRpcSchema, { Strict: true }>

  const request: Public = null as any

  const x1 = await request({ method: 'eth_blockNumber' })
  expectTypeOf<typeof x1>().toEqualTypeOf<Quantity>()

  const x2 = await request({
    method: 'eth_newFilter',
    params: [{ address: '0x', fromBlock: '0x', toBlock: '0x', topics: ['0x'] }],
  })
  expectTypeOf<typeof x2>().toEqualTypeOf<Quantity>()

  const x3 = await request({
    method: 'eth_getLogs',
    params: [{ address: '0x', fromBlock: '0x', toBlock: '0x', topics: ['0x'] }],
  })
  expectTypeOf<typeof x3>().toEqualTypeOf<RpcLog[]>()

  // @ts-expect-error
  request({ method: 'eth_newFilter' })
  request({ method: 'eth_wagmi' })
  request({ method: 'eth_wagmi', params: undefined })
  request({ method: 'eth_wagmi', params: [] })
  request({ method: 'eth_wagmi', params: [{ foo: 'bar' }] })

  expectTypeOf<Parameters<Public>[0]['method']>().toEqualTypeOf<
    PublicRpcSchema[number]['Method'] | (string & {})
  >()
})

test('public methods (strict)', async () => {
  type PublicStrict = EIP1193RequestFn<PublicRpcSchema, { Strict: true }>

  const request: PublicStrict = null as any

  const x1 = await request({ method: 'eth_blockNumber' })
  expectTypeOf<typeof x1>().toEqualTypeOf<Quantity>()

  const x2 = await request({
    method: 'eth_newFilter',
    params: [{ address: '0x', fromBlock: '0x', toBlock: '0x', topics: ['0x'] }],
  })
  expectTypeOf<typeof x2>().toEqualTypeOf<Quantity>()

  const x3 = await request({
    method: 'eth_getLogs',
    params: [{ address: '0x', fromBlock: '0x', toBlock: '0x', topics: ['0x'] }],
  })
  expectTypeOf<typeof x3>().toEqualTypeOf<RpcLog[]>()

  // @ts-expect-error
  request({ method: 'eth_newFilter' })
  // @ts-expect-error
  request({ method: 'eth_wagmi' })

  expectTypeOf<Parameters<PublicStrict>[0]['method']>().toEqualTypeOf<
    PublicRpcSchema[number]['Method']
  >()
})

test('wallet methods', async () => {
  type Wallet = EIP1193RequestFn<WalletRpcSchema>

  const request: Wallet = null as any

  const x1 = await request({ method: 'eth_accounts' })
  expectTypeOf<typeof x1>().toEqualTypeOf<Address[]>()

  const x2 = await request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: '0x',
      },
    ],
  })
  expectTypeOf<typeof x2>().toEqualTypeOf<Hash>()

  const x3 = await request({
    method: 'personal_sign',
    params: ['0x', '0x'],
  })
  expectTypeOf<typeof x3>().toEqualTypeOf<Hex>()

  // @ts-expect-error
  request({ method: 'eth_sendTransaction' })
  request({ method: 'eth_wagmi' })
  request({ method: 'eth_wagmi', params: undefined })
  request({ method: 'eth_wagmi', params: [] })
  request({ method: 'eth_wagmi', params: [{ foo: 'bar' }] })

  expectTypeOf<Parameters<Wallet>[0]['method']>().toEqualTypeOf<
    WalletRpcSchema[number]['Method'] | (string & {})
  >()
})

test('wallet methods (strict)', async () => {
  type Wallet = EIP1193RequestFn<WalletRpcSchema, { Strict: true }>

  const request: Wallet = null as any

  const x1 = await request({ method: 'eth_accounts' })
  expectTypeOf<typeof x1>().toEqualTypeOf<Address[]>()

  const x2 = await request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: '0x',
      },
    ],
  })
  expectTypeOf<typeof x2>().toEqualTypeOf<Hash>()

  const x3 = await request({
    method: 'personal_sign',
    params: ['0x', '0x'],
  })
  expectTypeOf<typeof x3>().toEqualTypeOf<Hex>()

  // @ts-expect-error
  request({ method: 'eth_sendTransaction' })
  // @ts-expect-error
  request({ method: 'eth_wagmi' })

  expectTypeOf<Parameters<Wallet>[0]['method']>().toEqualTypeOf<
    WalletRpcSchema[number]['Method']
  >()
})

test('test methods', async () => {
  type Test = EIP1193RequestFn<TestRpcSchema<'anvil'>, { Strict: false }>

  const request: Test = null as any

  const x1 = await request({
    method: 'anvil_addCompilationResult',
    params: [1],
  })
  expectTypeOf<typeof x1>().toEqualTypeOf<any>()

  const x2 = await request({
    method: 'anvil_enableTraces',
  })
  expectTypeOf<typeof x2>().toEqualTypeOf<void>()

  const x3 = await request({
    method: 'txpool_content',
  })
  expectTypeOf<typeof x3>().toEqualTypeOf<{
    pending: Record<`0x${string}`, Record<string, RpcTransaction>>
    queued: Record<`0x${string}`, Record<string, RpcTransaction>>
  }>()

  // @ts-expect-error
  request({ method: 'anvil_addCompilationResult' })
  request({ method: 'eth_wagmi' })
  request({ method: 'eth_wagmi', params: undefined })
  request({ method: 'eth_wagmi', params: [] })
  request({ method: 'eth_wagmi', params: [{ foo: 'bar' }] })

  expectTypeOf<Parameters<Test>[0]['method']>().toEqualTypeOf<
    TestRpcSchema<'anvil'>[number]['Method'] | (string & {})
  >()
})

test('test methods (strict)', async () => {
  type Test = EIP1193RequestFn<TestRpcSchema<'anvil'>, { Strict: true }>

  const request: Test = null as any

  const x1 = await request({
    method: 'anvil_addCompilationResult',
    params: [1],
  })
  expectTypeOf<typeof x1>().toEqualTypeOf<any>()

  const x2 = await request({
    method: 'anvil_enableTraces',
  })
  expectTypeOf<typeof x2>().toEqualTypeOf<void>()

  const x3 = await request({
    method: 'txpool_content',
  })
  expectTypeOf<typeof x3>().toEqualTypeOf<{
    pending: Record<`0x${string}`, Record<string, RpcTransaction>>
    queued: Record<`0x${string}`, Record<string, RpcTransaction>>
  }>()

  // @ts-expect-error
  request({ method: 'anvil_addCompilationResult' })
  // @ts-expect-error
  request({ method: 'eth_wagmi' })

  expectTypeOf<Parameters<Test>[0]['method']>().toEqualTypeOf<
    TestRpcSchema<'anvil'>[number]['Method']
  >()
})

test('custom methods', async () => {
  type Custom = EIP1193RequestFn<
    [
      { Method: 'eth_wagmi'; Parameters: [number]; ReturnType: string },
      { Method: 'eth_viem'; Parameters?: never; ReturnType: number },
    ],
    { Strict: false }
  >

  const request: Custom = null as any

  const x = await request({ method: 'eth_wagmi', params: [1] })
  expectTypeOf<typeof x>().toEqualTypeOf<string>()

  // @ts-expect-error
  request({ method: 'eth_wagmi' })
  request({ method: 'eth_viem' })
  request({ method: 'eth_lol' })

  expectTypeOf<Parameters<Custom>[0]['method']>().toEqualTypeOf<
    (string & {}) | 'eth_wagmi'
  >()
})

test('custom methods (strict)', async () => {
  type Custom = EIP1193RequestFn<
    [
      { Method: 'eth_wagmi'; Parameters: [number]; ReturnType: string },
      { Method: 'eth_viem'; Parameters?: never; ReturnType: number },
    ],
    { Strict: true }
  >

  const request: Custom = null as any

  const x = await request({ method: 'eth_wagmi', params: [1] })
  expectTypeOf<typeof x>().toEqualTypeOf<string>()

  // @ts-expect-error
  request({ method: 'eth_wagmi' })
  // @ts-expect-error
  request({ method: 'eth_lol' })

  expectTypeOf<Parameters<Custom>[0]['method']>().toEqualTypeOf<
    'eth_wagmi' | 'eth_viem'
  >()
})
