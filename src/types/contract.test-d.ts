import type { ResolvedConfig } from 'abitype'
import type { seaportAbi } from 'abitype/test'
import { expectTypeOf, test } from 'vitest'

import type {
  ContractFunctionConfig,
  ContractFunctionResult,
  GetValue,
  GetConstructorArgs,
  GetErrorArgs,
  InferErrorName,
  InferEventName,
  GetFunctionArgs,
  InferFunctionName,
  InferItemName,
  GetEventArgs,
  GetEventArgsFromTopics,
  DistributeLogTopicType,
  AbiEventTopicToPrimitiveType,
  AbiEventParameterToPrimitiveType,
} from './contract'
import type { Hex } from './misc'

test('ContractFunctionConfig', async () => {
  type Result = ContractFunctionConfig<typeof seaportAbi, 'getOrderStatus'>
  //   ^?
  expectTypeOf<Result>().toEqualTypeOf<{
    abi: typeof seaportAbi
    address: ResolvedConfig['AddressType']
    functionName:
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
    args: readonly [ResolvedConfig['BytesType']['inputs']]
  }>()
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
  // rome-ignore lint/correctness/noUnusedVariables: <explanation>
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
  // expectTypeOf<Result>().toEqualTypeOf<{
  //   offerer?: `0x${string}` | `0x${string}`[] | null | undefined
  //   zone?: `0x${string}` | `0x${string}`[] | null | undefined
  // }>()
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
    args?:
      | {
          from: `0x${string}`
          to: `0x${string}`
        }
      | undefined
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
  expectTypeOf<Result>().toEqualTypeOf<bigint | undefined>()

  // other
  expectTypeOf<
    GetValue<typeof seaportAbi, 'getOrderStatus'>
  >().toEqualTypeOf<never>()
  expectTypeOf<GetValue<typeof seaportAbi, 'cancel'>>().toEqualTypeOf<never>()
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

test('DistributeLogTopicType', () => {
  expectTypeOf<DistributeLogTopicType<string, Hex>>().toEqualTypeOf<string>()
  expectTypeOf<DistributeLogTopicType<string, Hex[]>>().toEqualTypeOf<
    string[]
  >()
  expectTypeOf<DistributeLogTopicType<string, null>>().toEqualTypeOf<null>()

  expectTypeOf<DistributeLogTopicType<string, Hex | null>>().toEqualTypeOf<
    string | null
  >()
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

test('AbiEventParameterToPrimitiveType', () => {
  expectTypeOf<
    AbiEventParameterToPrimitiveType<{ name: 'foo'; type: 'string' }>
  >().toEqualTypeOf<string | string[] | null>()
  expectTypeOf<
    AbiEventParameterToPrimitiveType<
      { name: 'foo'; type: 'string' },
      {
        EnableUnion: false
        IndexedOnly: true
        Required: false
      }
    >
  >().toEqualTypeOf<string>()
})

test('AbiEventParametersToPrimitiveTypes', () => {
  // type Result = AbiEventParametersToPrimitiveTypes<
  //   [{ name: 'foo'; type: 'string'; indexed: true }]
  // >
})
