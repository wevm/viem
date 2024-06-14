import {
  type Abi,
  type Address,
  type ResolvedRegister,
  parseAbi,
} from 'abitype'
import type { seaportAbi } from 'abitype/abis'
import { expectTypeOf, test } from 'vitest'

import type {
  AbiEventParameterToPrimitiveType,
  AbiEventParametersToPrimitiveTypes,
  AbiEventTopicToPrimitiveType,
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  ContractFunctionReturnType,
  ExtractAbiFunctionForArgs,
  GetEventArgs,
  GetValue,
  LogTopicType,
  Widen,
} from './contract.js'
import type { Hex } from './misc.js'

test('ContractFunctionName', () => {
  expectTypeOf<ContractFunctionName<typeof seaportAbi>>().toEqualTypeOf<
    | 'cancel'
    | 'fulfillBasicOrder'
    | 'fulfillBasicOrder_efficient_6GL6yc'
    | 'fulfillOrder'
    | 'fulfillAdvancedOrder'
    | 'fulfillAvailableOrders'
    | 'fulfillAvailableAdvancedOrders'
    | 'getContractOffererNonce'
    | 'getOrderHash'
    | 'getOrderStatus'
    | 'getCounter'
    | 'incrementCounter'
    | 'information'
    | 'name'
    | 'matchAdvancedOrders'
    | 'matchOrders'
    | 'validate'
  >()

  expectTypeOf<
    ContractFunctionName<typeof seaportAbi, 'pure' | 'view'>
  >().toEqualTypeOf<
    | 'name'
    | 'getContractOffererNonce'
    | 'getCounter'
    | 'getOrderHash'
    | 'getOrderStatus'
    | 'information'
  >()
})

test('ContractFunctionArgs', () => {
  expectTypeOf<
    ContractFunctionArgs<typeof seaportAbi, 'pure' | 'view', 'getOrderStatus'>
  >().toEqualTypeOf<readonly [Address]>()

  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])
  expectTypeOf<
    ContractFunctionArgs<typeof abi, 'pure' | 'view', 'foo'>
  >().toEqualTypeOf<
    readonly [] | readonly [Address] | readonly [Address, Address]
  >()
})

test('ContractFunctionParameters', () => {
  type Result = ContractFunctionParameters<
    typeof seaportAbi,
    'pure' | 'view',
    'getOrderStatus'
  >
  expectTypeOf<Result['args']>().toEqualTypeOf<readonly [Address]>()
})

test('ContractFunctionReturnType', () => {
  type Result = ContractFunctionReturnType<
    typeof seaportAbi,
    'pure' | 'view',
    'getOrderStatus'
  >
  expectTypeOf<Result>().toEqualTypeOf<
    readonly [boolean, boolean, bigint, bigint]
  >()
})

test('Widen', () => {
  expectTypeOf<Widen<1>>().toEqualTypeOf<number>()
  expectTypeOf<Widen<1n>>().toEqualTypeOf<bigint>()
  expectTypeOf<Widen<true>>().toEqualTypeOf<boolean>()
  expectTypeOf<Widen<'foo'>>().toEqualTypeOf<string>()
  expectTypeOf<Widen<'0x123'>>().toEqualTypeOf<Address>()
  expectTypeOf<Widen<'0xbytes'>>().toEqualTypeOf<
    ResolvedRegister['BytesType']['inputs']
  >()

  expectTypeOf<Widen<[]>>().toEqualTypeOf<readonly []>()

  expectTypeOf<Widen<{ foo: 'bar'; boo: 123n }>>().toEqualTypeOf<{
    foo: string
    boo: bigint
  }>()
  expectTypeOf<Widen<{ foo: 'bar'; boo: [123n] }>>().toEqualTypeOf<{
    foo: string
    boo: readonly [bigint]
  }>()

  expectTypeOf<Widen<[123n]>>().toEqualTypeOf<readonly [bigint]>()
  expectTypeOf<Widen<[{ foo: 'bar'; boo: 123n }]>>().toEqualTypeOf<
    readonly [{ foo: string; boo: bigint }]
  >()

  expectTypeOf<Widen<123n[]>>().toEqualTypeOf<readonly bigint[]>()
  expectTypeOf<Widen<(123n | '0x')[]>>().toEqualTypeOf<
    readonly (bigint | Address)[]
  >()

  expectTypeOf<Widen<readonly unknown[]>>().toEqualTypeOf<readonly unknown[]>()
})

test('ExtractAbiFunctionForArgs', () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  expectTypeOf<
    ExtractAbiFunctionForArgs<typeof abi, 'pure' | 'view', 'foo', []>
  >().toEqualTypeOf<(typeof abi)[0]>()
  expectTypeOf<
    ExtractAbiFunctionForArgs<typeof abi, 'pure' | 'view', 'foo', readonly []>
  >().toEqualTypeOf<(typeof abi)[0]>()
  expectTypeOf<
    ExtractAbiFunctionForArgs<typeof abi, 'pure' | 'view', 'foo', ['0x']>
  >().toEqualTypeOf<(typeof abi)[1]>()
  expectTypeOf<
    ExtractAbiFunctionForArgs<typeof abi, 'pure' | 'view', 'foo', ['0x', '0x']>
  >().toEqualTypeOf<(typeof abi)[2]>()

  expectTypeOf<
    ExtractAbiFunctionForArgs<typeof abi, 'payable', never, never>
  >().toEqualTypeOf<never>()
})

test('ContractFunctionReturnType', () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  expectTypeOf<
    ContractFunctionReturnType<typeof abi, 'pure' | 'view', 'foo', readonly []>
  >().toEqualTypeOf<number>()
  expectTypeOf<
    ContractFunctionReturnType<typeof abi, 'pure' | 'view', 'foo'>
  >().toEqualTypeOf<number>()
  expectTypeOf<
    ContractFunctionReturnType<
      typeof abi,
      'pure' | 'view',
      'foo',
      readonly ['0x']
    >
  >().toEqualTypeOf<string>()
  expectTypeOf<
    ContractFunctionReturnType<
      typeof abi,
      'pure' | 'view',
      'foo',
      readonly ['0x', '0x']
    >
  >().toEqualTypeOf<{ foo: Address; bar: Address }>()
})

test('GetEventArgs', () => {
  type Result = GetEventArgs<
    [
      {
        inputs: [
          {
            indexed: true
            name: 'from'
            type: 'address'
          },
          {
            indexed: true
            name: 'to'
            type: 'address'
          },
          {
            indexed: false
            name: 'tokenId'
            type: 'uint256'
          },
        ]
        name: 'Transfer'
        type: 'event'
      },
    ],
    'Transfer'
  >
  expectTypeOf<Result>().toEqualTypeOf<{
    from?: `0x${string}` | `0x${string}`[] | null | undefined
    to?: `0x${string}` | `0x${string}`[] | null | undefined
  }>()
})

test('GetValue', () => {
  // payable
  type Result = GetValue<typeof seaportAbi, 'fulfillAdvancedOrder'>
  expectTypeOf<Result>().toEqualTypeOf<{ value?: bigint }>()

  // other
  expectTypeOf<GetValue<typeof seaportAbi, 'getOrderStatus'>>().toEqualTypeOf<{
    value?: never
  }>()
  expectTypeOf<GetValue<typeof seaportAbi, 'cancel'>>().toEqualTypeOf<{
    value?: never
  }>()

  // unknown abi
  expectTypeOf<GetValue<Abi, 'foo'>>().toEqualTypeOf<{
    value?: bigint | undefined
  }>()
  const abi = [
    {
      type: 'function',
      name: 'foo',
      inputs: [],
      outputs: [{ type: 'uint256' }],
    },
  ]
  expectTypeOf<GetValue<typeof abi, 'foo'>>().toEqualTypeOf<{
    value?: bigint | undefined
  }>()
})

// -----------------------------------------------------------------------------------------------

test('LogTopicType', () => {
  expectTypeOf<LogTopicType<string, Hex>>().toEqualTypeOf<string>()
  expectTypeOf<LogTopicType<string, Hex[]>>().toEqualTypeOf<string[]>()
  expectTypeOf<LogTopicType<string, null>>().toEqualTypeOf<null>()

  expectTypeOf<LogTopicType<string, Hex | null>>().toEqualTypeOf<
    string | null
  >()
})

test('AbiEventParameterToPrimitiveType', () => {
  expectTypeOf<
    AbiEventParameterToPrimitiveType<{ name: 'foo'; type: 'string' }>
  >().toEqualTypeOf<string | string[] | null>()
  expectTypeOf<
    AbiEventParameterToPrimitiveType<
      { name: 'foo'; type: 'string' },
      { EnableUnion: false }
    >
  >().toEqualTypeOf<string>()
})

test('AbiEventTopicToPrimitiveType', () => {
  expectTypeOf<
    AbiEventTopicToPrimitiveType<{ name: 'foo'; type: 'string' }, Hex>
  >().toEqualTypeOf<`0x${string}`>()
  expectTypeOf<
    AbiEventTopicToPrimitiveType<{ name: 'foo'; type: 'string' }, Hex[]>
  >().toEqualTypeOf<`0x${string}`[][]>() // TODO: Is this correct?
  expectTypeOf<
    AbiEventTopicToPrimitiveType<{ name: 'foo'; type: 'string' }, null>
  >().toEqualTypeOf<null>()

  expectTypeOf<
    AbiEventTopicToPrimitiveType<{ name: 'foo'; type: 'string' }, Hex | null>
  >().toEqualTypeOf<`0x${string}` | null>()

  expectTypeOf<
    AbiEventTopicToPrimitiveType<{ name: 'foo'; type: 'bool' }, Hex>
  >().toEqualTypeOf<boolean>()
  expectTypeOf<
    AbiEventTopicToPrimitiveType<{ name: 'foo'; type: 'bool' }, Hex[]>
  >().toEqualTypeOf<boolean[]>()
})

test('AbiEventParametersToPrimitiveTypes', () => {
  // named parameters
  expectTypeOf<
    AbiEventParametersToPrimitiveTypes<
      [{ name: 'foo'; type: 'string'; indexed: true }]
    >
  >().toEqualTypeOf<{
    foo?: string | string[] | null | undefined
  }>()
  expectTypeOf<
    AbiEventParametersToPrimitiveTypes<
      [
        { name: 'foo'; type: 'string'; indexed: true },
        { name: 'bar'; type: 'uint8'; indexed: true },
        { name: 'baz'; type: 'address'; indexed: false },
      ]
    >
  >().toEqualTypeOf<{
    foo?: string | string[] | null | undefined
    bar?: number | number[] | null | undefined
  }>()

  type Named_AllowNonIndexed = AbiEventParametersToPrimitiveTypes<
    [
      { name: 'foo'; type: 'string'; indexed: true },
      { name: 'bar'; type: 'uint8'; indexed: true },
      { name: 'baz'; type: 'address'; indexed: false },
    ],
    {
      EnableUnion: true
      IndexedOnly: false
      Required: false
    }
  >
  expectTypeOf<Named_AllowNonIndexed>().toEqualTypeOf<{
    foo?: string | string[] | null | undefined
    bar?: number | number[] | null | undefined
    baz?: `0x${string}` | `0x${string}`[] | null | undefined
  }>()
  type Named_DisableUnion = AbiEventParametersToPrimitiveTypes<
    [
      { name: 'foo'; type: 'string'; indexed: true },
      { name: 'bar'; type: 'uint8'; indexed: true },
      { name: 'baz'; type: 'address'; indexed: false },
    ],
    {
      EnableUnion: false
      IndexedOnly: true
      Required: false
    }
  >
  expectTypeOf<Named_DisableUnion>().toEqualTypeOf<{
    foo?: string
    bar?: number
  }>()

  // unnamed parameters
  expectTypeOf<
    AbiEventParametersToPrimitiveTypes<
      [
        { type: 'string'; indexed: true },
        { type: 'uint8'; indexed: true },
        {
          type: 'address'
          indexed: false
        },
      ]
    >
  >().toEqualTypeOf<
    | readonly []
    | readonly [string | string[] | null]
    | readonly [string | string[] | null, number | number[] | null]
  >()

  type Unnamed_AllowNonIndexed = AbiEventParametersToPrimitiveTypes<
    [
      { type: 'string'; indexed: true },
      { type: 'uint8'; indexed: true },
      { type: 'address'; indexed: false },
    ],
    {
      EnableUnion: true
      IndexedOnly: false
      Required: false
    }
  >
  expectTypeOf<Unnamed_AllowNonIndexed>().toEqualTypeOf<
    | readonly []
    | readonly [string | string[] | null]
    | readonly [string | string[] | null, number | number[] | null]
    | readonly [
        string | string[] | null,
        number | number[] | null,
        `0x${string}` | `0x${string}`[] | null,
      ]
  >()

  type Unnamed_DisableUnion = AbiEventParametersToPrimitiveTypes<
    [
      { type: 'string'; indexed: true },
      { type: 'uint8'; indexed: true },
      { type: 'address'; indexed: false },
    ],
    {
      EnableUnion: false
      IndexedOnly: true
      Required: false
    }
  >
  expectTypeOf<Unnamed_DisableUnion>().toEqualTypeOf<
    readonly [] | readonly [string] | readonly [string, number]
  >()

  // mixed parameters (named and unnamed)
  expectTypeOf<
    AbiEventParametersToPrimitiveTypes<
      [
        { type: 'string'; indexed: true },
        { named: 'bar'; type: 'uint8'; indexed: true },
      ]
    >
  >().toEqualTypeOf<
    | readonly []
    | readonly [string | string[] | null]
    | readonly [string | string[] | null, number | number[] | null]
  >()
})
