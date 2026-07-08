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

/** Checks if a user is authorized by a TIP-403 transfer policy. */
export async function isAuthorized<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: isAuthorized.Options,
): Promise<isAuthorized.ReturnType> {
  const { policyId, user, ...rest } = options
  return read(client, {
    ...rest,
    ...isAuthorized.call({ policyId, user }),
  })
}

export namespace isAuthorized {
  export type Args = {
    /** Policy ID. */
    policyId: bigint
    /** User address to check. */
    user: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = boolean
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `isAuthorized` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [args.policyId, args.user],
      functionName: 'isAuthorized',
    })
  }
}
