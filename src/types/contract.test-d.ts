import { type Abi, type Address, type ResolvedConfig, parseAbi } from 'abitype'
import { seaportAbi } from 'abitype/test'
import { expectTypeOf, test } from 'vitest'

import type {
  AbiEventParameterToPrimitiveType,
  AbiEventParametersToPrimitiveTypes,
  AbiEventTopicToPrimitiveType,
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionResult,
  ContractFunctionReturnType,
  ExtractAbiFunctionForArgs,
  GetConstructorArgs,
  GetErrorArgs,
  GetEventArgs,
  GetEventArgsFromTopics,
  GetFunctionArgs,
  GetValue,
  InferErrorName,
  InferEventName,
  InferFunctionName,
  InferItemName,
  LogTopicType,
  Widen,
} from './contract.js'
import type { Hex } from './misc.js'

test('FunctionName', () => {
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

test('Args', () => {
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

test('Widen', () => {
  expectTypeOf<Widen<1>>().toEqualTypeOf<number>()
  expectTypeOf<Widen<1n>>().toEqualTypeOf<bigint>()
  expectTypeOf<Widen<true>>().toEqualTypeOf<boolean>()
  expectTypeOf<Widen<'foo'>>().toEqualTypeOf<string>()
  expectTypeOf<Widen<'0x123'>>().toEqualTypeOf<Address>()
  expectTypeOf<Widen<'0xbytes'>>().toEqualTypeOf<
    ResolvedConfig['BytesType']['inputs']
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
  >().toEqualTypeOf<typeof abi[0]>()
  expectTypeOf<
    ExtractAbiFunctionForArgs<typeof abi, 'pure' | 'view', 'foo', ['0x']>
  >().toEqualTypeOf<typeof abi[1]>()
  expectTypeOf<
    ExtractAbiFunctionForArgs<typeof abi, 'pure' | 'view', 'foo', ['0x', '0x']>
  >().toEqualTypeOf<typeof abi[2]>()

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

test('ContractFunctionResult', () => {
  type Result = ContractFunctionResult<typeof seaportAbi, 'getOrderStatus'>
  //   ^?
  expectTypeOf<Result>().toEqualTypeOf<
    readonly [boolean, boolean, bigint, bigint]
  >()
})

test('GetConstructorArgs', () => {
  type Result = GetConstructorArgs<typeof seaportAbi>
  expectTypeOf<Result>().toEqualTypeOf<{
    args: readonly [`0x${string}`]
  }>()
})

test('GetErrorArgs', () => {
  type Result = GetErrorArgs<
    typeof seaportAbi,
    'ERC1155BatchTransferGenericFailure'
  >
  expectTypeOf<Result>().toEqualTypeOf<{
    args: readonly [
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      readonly bigint[],
      readonly bigint[],
    ]
  }>()
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

test('GetEventArgsFromTopics', () => {
  type Result = GetEventArgsFromTopics<
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
    'Transfer',
    [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    ],
    '0x0000000000000000000000000000000000000000000000000000000000000001'
  >
  expectTypeOf<Result>().toEqualTypeOf<{
    args: {
      from: `0x${string}`
      to: `0x${string}`
      tokenId: bigint
    }
  }>()
})

test('GetFunctionArgs', () => {
  type Result = GetFunctionArgs<typeof seaportAbi, 'getOrderStatus'>
  expectTypeOf<Result>().toEqualTypeOf<{
    args: readonly [ResolvedConfig['BytesType']['inputs']]
  }>()
})

test('GetValue', () => {
  // payable
  type Result = GetValue<typeof seaportAbi, 'fulfillAdvancedOrder'>
  expectTypeOf<Result>().toEqualTypeOf<{ value: bigint }>()

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

test('InferErrorName', () => {
  type Result = InferErrorName<typeof seaportAbi, 'BadContractSignature'>
  expectTypeOf<Result>().toEqualTypeOf<
    | 'BadContractSignature'
    | 'BadFraction'
    | 'BadReturnValueFromERC20OnTransfer'
    | 'BadSignatureV'
    | 'CannotCancelOrder'
    | 'ConsiderationCriteriaResolverOutOfRange'
    | 'ConsiderationLengthNotEqualToTotalOriginal'
    | 'ConsiderationNotMet'
    | 'CriteriaNotEnabledForItem'
    | 'ERC1155BatchTransferGenericFailure'
    | 'InexactFraction'
    | 'InsufficientNativeTokensSupplied'
    | 'Invalid1155BatchTransferEncoding'
    | 'InvalidBasicOrderParameterEncoding'
    | 'InvalidCallToConduit'
    | 'InvalidConduit'
    | 'InvalidContractOrder'
    | 'InvalidERC721TransferAmount'
    | 'InvalidFulfillmentComponentData'
    | 'InvalidMsgValue'
    | 'InvalidNativeOfferItem'
    | 'InvalidProof'
    | 'InvalidRestrictedOrder'
    | 'InvalidSignature'
    | 'InvalidSigner'
    | 'InvalidTime'
    | 'MismatchedFulfillmentOfferAndConsiderationComponents'
    | 'MissingFulfillmentComponentOnAggregation'
    | 'MissingItemAmount'
    | 'MissingOriginalConsiderationItems'
    | 'NativeTokenTransferGenericFailure'
    | 'NoContract'
    | 'NoReentrantCalls'
    | 'NoSpecifiedOrdersAvailable'
    | 'OfferAndConsiderationRequiredOnFulfillment'
    | 'OfferCriteriaResolverOutOfRange'
    | 'OrderAlreadyFilled'
    | 'OrderCriteriaResolverOutOfRange'
    | 'OrderIsCancelled'
    | 'OrderPartiallyFilled'
    | 'PartialFillsNotEnabledForOrder'
    | 'TokenTransferGenericFailure'
    | 'UnresolvedConsiderationCriteria'
    | 'UnresolvedOfferCriteria'
    | 'UnusedItemParameters'
  >('BadContractSignature')
})

test('InferEventName', () => {
  type Result = InferEventName<typeof seaportAbi, 'CounterIncremented'>
  expectTypeOf<Result>().toEqualTypeOf<
    | 'CounterIncremented'
    | 'OrderCancelled'
    | 'OrderFulfilled'
    | 'OrdersMatched'
    | 'OrderValidated'
  >('CounterIncremented')
})

test('InferFunctionName', () => {
  type Result = InferFunctionName<typeof seaportAbi, 'getOrderStatus'>
  expectTypeOf<Result>().toEqualTypeOf<
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
  >('getOrderStatus')
})

test('InferItemName', () => {
  type Result = InferItemName<typeof seaportAbi, 'getOrderStatus'>
  expectTypeOf<Result>().toEqualTypeOf<
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
    | 'CounterIncremented'
    | 'OrderCancelled'
    | 'OrderFulfilled'
    | 'OrdersMatched'
    | 'OrderValidated'
    | 'BadContractSignature'
    | 'BadFraction'
    | 'BadReturnValueFromERC20OnTransfer'
    | 'BadSignatureV'
    | 'CannotCancelOrder'
    | 'ConsiderationCriteriaResolverOutOfRange'
    | 'ConsiderationLengthNotEqualToTotalOriginal'
    | 'ConsiderationNotMet'
    | 'CriteriaNotEnabledForItem'
    | 'ERC1155BatchTransferGenericFailure'
    | 'InexactFraction'
    | 'InsufficientNativeTokensSupplied'
    | 'Invalid1155BatchTransferEncoding'
    | 'InvalidBasicOrderParameterEncoding'
    | 'InvalidCallToConduit'
    | 'InvalidConduit'
    | 'InvalidContractOrder'
    | 'InvalidERC721TransferAmount'
    | 'InvalidFulfillmentComponentData'
    | 'InvalidMsgValue'
    | 'InvalidNativeOfferItem'
    | 'InvalidProof'
    | 'InvalidRestrictedOrder'
    | 'InvalidSignature'
    | 'InvalidSigner'
    | 'InvalidTime'
    | 'MismatchedFulfillmentOfferAndConsiderationComponents'
    | 'MissingFulfillmentComponentOnAggregation'
    | 'MissingItemAmount'
    | 'MissingOriginalConsiderationItems'
    | 'NativeTokenTransferGenericFailure'
    | 'NoContract'
    | 'NoReentrantCalls'
    | 'NoSpecifiedOrdersAvailable'
    | 'OfferAndConsiderationRequiredOnFulfillment'
    | 'OfferCriteriaResolverOutOfRange'
    | 'OrderAlreadyFilled'
    | 'OrderCriteriaResolverOutOfRange'
    | 'OrderIsCancelled'
    | 'OrderPartiallyFilled'
    | 'PartialFillsNotEnabledForOrder'
    | 'TokenTransferGenericFailure'
    | 'UnresolvedConsiderationCriteria'
    | 'UnresolvedOfferCriteria'
    | 'UnusedItemParameters'
  >('getOrderStatus')
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
