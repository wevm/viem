import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'

/** Gets an order's details from the orderbook. */
export async function getOrder<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getOrder.Options,
): Promise<getOrder.ReturnType> {
  const { orderId, ...rest } = options
  return read(client, { ...rest, ...getOrder.call({ orderId }) })
}

export namespace getOrder {
  export type Args = { /** Order ID to query. */ orderId: bigint }
  export type Options = ReadParameters & Args
  export type ReturnType = {
    /** Order ID. */ orderId: bigint
    /** Order maker. */ maker: Address.Address
    /** Orderbook key. */ bookKey: `0x${string}`
    /** Whether the order is on the bid side. */ isBid: boolean
    /** Price tick. */ tick: number
    /** Original order amount. */ amount: bigint
    /** Remaining order amount. */ remaining: bigint
    /** Previous order ID at this tick. */ prev: bigint
    /** Next order ID at this tick. */ next: bigint
    /** Whether the order flips when filled. */ isFlip: boolean
    /** Target tick for the flipped order. */ flipTick: number
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
  /** Defines a call to the `getOrder` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [args.orderId],
      functionName: 'getOrder',
    })
  }
}
