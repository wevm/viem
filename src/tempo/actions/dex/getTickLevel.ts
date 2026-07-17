import type { Address, Errors } from 'ox'

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

/** Gets the price level information at a specific tick. */
export async function getTickLevel<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getTickLevel.Options,
): Promise<getTickLevel.ReturnType> {
  const { base, isBid, tick, ...rest } = options
  const { head, tail, totalLiquidity } = await read(client, {
    ...rest,
    ...getTickLevel.call(client, { base, isBid, tick }),
  })
  return { head, tail, totalLiquidity }
}

export namespace getTickLevel {
  export type Args = {
    /** Base token to query. */ base: Address.Address
    /** Whether to query the bid side (true) or ask side (false). */ isBid: boolean
    /** Price tick to query. */ tick: number
  }
  export type Options = ReadParameters & Args
  export type ReturnType = {
    /** Order ID of the first order at this tick (0 if empty). */ head: bigint
    /** Order ID of the last order at this tick (0 if empty). */ tail: bigint
    /** Total liquidity available at this tick level. */ totalLiquidity: bigint
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
  /** Defines a call to the `getTickLevel` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [args.base, args.tick, args.isBid],
      functionName: 'getTickLevel',
    })
  }
}
