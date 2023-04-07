import { assertType, expectTypeOf, test } from 'vitest'
import { seaportAbi } from 'abitype/test'

import type { WriteContractParameters } from './writeContract.js'

test('WriteContractParameters', async () => {
  type Result = WriteContractParameters<typeof seaportAbi, 'cancel'>
  expectTypeOf<Result['functionName']>().toEqualTypeOf<
    | 'cancel'
    | 'fulfillAdvancedOrder'
    | 'fulfillAvailableAdvancedOrders'
    | 'fulfillAvailableOrders'
    | 'fulfillBasicOrder'
    | 'fulfillBasicOrder_efficient_6GL6yc'
    | 'fulfillOrder'
    | 'incrementCounter'
    | 'matchAdvancedOrders'
    | 'matchOrders'
    | 'validate'
  >()

  const address = '0x' as const
  assertType<WriteContractParameters<typeof seaportAbi, 'cancel'>>({
    abi: seaportAbi,
    account: address,
    address,
    functionName: 'cancel',
    // ^?
    args: [
      [
        {
          offerer: address,
          zone: address,
          offer: [
            {
              itemType: 1,
              token: address,
              identifierOrCriteria: 1n,
              startAmount: 1n,
              endAmount: 1n,
            },
          ],
          consideration: [
            {
              itemType: 1,
              token: address,
              identifierOrCriteria: 1n,
              startAmount: 1n,
              endAmount: 1n,
              recipient: address,
            },
          ],
          counter: 1n,
          orderType: 1,
          startTime: 1n,
          endTime: 1n,
          salt: 1n,
          conduitKey: address,
          zoneHash: address,
        },
      ],
    ],
  })
})
