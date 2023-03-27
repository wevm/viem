import type { ResolvedConfig } from 'abitype'
import type { seaportAbi } from 'abitype/test'
import { expectTypeOf, test } from 'vitest'

import type { ContractConfig, ExtractResultFromAbi } from './contract.js'

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
