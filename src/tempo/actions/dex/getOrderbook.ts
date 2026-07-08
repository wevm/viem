import { Hash, Hex } from 'ox'
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

/** Gets orderbook information for a trading pair. */
export async function getOrderbook<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getOrderbook.Options,
): Promise<getOrderbook.ReturnType> {
  const { base, quote, ...rest } = options
  return read(client, {
    ...rest,
    ...getOrderbook.call(client, { base, quote }),
  })
}

export namespace getOrderbook {
  export type Args = {
    /** Base token. */ base: Address.Address
    /** Quote token. */ quote: Address.Address
  }
  export type Options = ReadParameters & Args
  export type ReturnType = {
    /** Base token address. */ base: Address.Address
    /** Quote token address. */ quote: Address.Address
    /** Best bid tick. */ bestBidTick: number
    /** Best ask tick. */ bestAskTick: number
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
  /** Defines a call to the `books` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { base, quote } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [Hash.keccak256(Hex.concat(base, quote))],
      functionName: 'books',
    })
  }
}
