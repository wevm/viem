import { expectTypeOf, test } from 'vitest'
import { seaportAbi } from 'abitype/test'

import { ContractConfig, ExtractResultFromAbi } from './contract'
import { ResolvedConfig } from 'abitype'

test('ContractConfig', async () => {
  type Result = ContractConfig<typeof seaportAbi, 'getOrderStatus'>
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

test('ExtractResultFromAbi', () => {
  type Result = ExtractResultFromAbi<typeof seaportAbi, 'getOrderStatus'>
  //   ^?
  expectTypeOf<Result>().toEqualTypeOf<
    readonly [boolean, boolean, bigint, bigint]
  >()
})
