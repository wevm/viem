import type { Errors, Hex } from 'ox'

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

/** Gets the blocked balance for an encoded receipt. */
export async function getBlockedBalance<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getBlockedBalance.Options,
): Promise<getBlockedBalance.ReturnType> {
  const { receipt, ...rest } = options
  return read(client, {
    ...rest,
    ...getBlockedBalance.call({ receipt }),
  })
}

export namespace getBlockedBalance {
  export type Args = {
    /** The encoded claim receipt. */
    receipt: Hex.Hex
  }
  export type Options = ReadParameters & Args
  export type ReturnType = read.ReturnType<
    typeof Abis.receivePolicyGuard,
    'balanceOf'
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `balanceOf` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.receivePolicyGuard,
      address: Addresses.receivePolicyGuard,
      args: [args.receipt],
      functionName: 'balanceOf',
    })
  }
}
