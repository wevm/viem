import type { Address } from 'abitype'
import { expectTypeOf, test } from 'vitest'
import type {
  EIP1193Parameters,
  EIP1193RequestFn,
  PublicRpcSchema,
  TestRpcSchema,
  WalletRpcSchema,
} from './eip1193.js'
import type { Hash, Hex } from './misc.js'
import type { Quantity, RpcLog, RpcTransaction } from './rpc.js'

test('default', async () => {
  type DefaultRequestFn = EIP1193RequestFn
  type DefaultParameters = EIP1193Parameters

  const request: DefaultRequestFn = null as any

  const x = await request({ method: 'eth_wagmi' })
  expectTypeOf<typeof x>().toEqualTypeOf<unknown>()

  request({ method: 'eth_wagmi', params: undefined })
  request({ method: 'eth_wagmi', params: [] })
  request({ method: 'eth_wagmi', params: [{ foo: 'bar' }] })

  expectTypeOf<DefaultParameters>().toEqualTypeOf<{
    method: string
    params?: unknown
  }>()
  expectTypeOf<ReturnType<DefaultRequestFn>>().toEqualTypeOf<Promise<unknown>>()
})

test('public methods', async () => {
  type PublicRequestFn = EIP1193RequestFn<PublicRpcSchema>
  type PublicParameters = EIP1193Parameters<PublicRpcSchema>

  const request: PublicRequestFn = null as any

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

  const x4 = await request<{
    Method: 'eth_wagmi'
    Parameters: undefined
    ReturnType: number
  }>({ method: 'eth_wagmi' })
  expectTypeOf<typeof x4>().toEqualTypeOf<number>()

  // @ts-expect-error
  request({ method: 'eth_newFilter' })
  // @ts-expect-error
  request({ method: 'eth_wagmi' })

  expectTypeOf<PublicParameters['method']>().toEqualTypeOf<
    PublicRpcSchema[number]['Method']
  >()
})

test('wallet methods', async () => {
  type WalletRequestFn = EIP1193RequestFn<WalletRpcSchema>
  type WalletParameters = EIP1193Parameters<WalletRpcSchema>

  const request: WalletRequestFn = null as any

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

  const x4 = await request<{
    Method: 'eth_wagmi'
    Parameters: undefined
    ReturnType: number
  }>({ method: 'eth_wagmi' })
  expectTypeOf<typeof x4>().toEqualTypeOf<number>()

  // @ts-expect-error
  request({ method: 'eth_sendTransaction' })
  // @ts-expect-error
  request({ method: 'eth_wagmi' })

  expectTypeOf<WalletParameters['method']>().toEqualTypeOf<
    WalletRpcSchema[number]['Method']
  >()
})

test('test methods (strict)', async () => {
  type TestRequestFn = EIP1193RequestFn<TestRpcSchema<'anvil'>>
  type TestParameters = EIP1193Parameters<TestRpcSchema<'anvil'>>

  const request: TestRequestFn = null as any

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

  const x4 = await request<{
    Parameters: undefined
    ReturnType: number
  }>({ method: 'eth_wagmi' })
  expectTypeOf<typeof x4>().toEqualTypeOf<number>()

  // @ts-expect-error
  request({ method: 'anvil_addCompilationResult' })
  // @ts-expect-error
  request({ method: 'anvil_addCompilationResult', params: 'lol' })
  // @ts-expect-error
  request({ method: 'eth_wagmi' })

  expectTypeOf<TestParameters['method']>().toEqualTypeOf<
    TestRpcSchema<'anvil'>[number]['Method']
  >()
})

test('custom methods (strict)', async () => {
  type CustomSchema = [
    { Method: 'eth_wagmi'; Parameters: [number]; ReturnType: string },
    { Method: 'eth_viem'; Parameters?: never; ReturnType: number },
  ]
  type CustomRequestFn = EIP1193RequestFn<CustomSchema>
  type CustomParameters = EIP1193Parameters<CustomSchema>

  const request: CustomRequestFn = null as any

  const x1 = await request({ method: 'eth_wagmi', params: [1] })
  expectTypeOf<typeof x1>().toEqualTypeOf<string>()

  const x2 = await request<{ Parameters: undefined; ReturnType: number }>({
    method: 'eth_wagmi',
  })
  expectTypeOf<typeof x2>().toEqualTypeOf<number>()

  // @ts-expect-error
  request({ method: 'eth_wagmi' })
  // @ts-expect-error
  request({ method: 'eth_lol' })

  expectTypeOf<CustomParameters['method']>().toEqualTypeOf<
    CustomSchema[number]['Method']
  >()
})
