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
import type { PolicyType } from './create.js'

/** Gets TIP-403 transfer policy data. */
export async function getData<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getData.Options,
): Promise<getData.ReturnType> {
  const { policyId, ...rest } = options
  const result = await read(client, {
    ...rest,
    ...getData.call({ policyId }),
  })
  return {
    admin: result[1],
    type: result[0] === 0 ? 'whitelist' : 'blacklist',
  }
}

export namespace getData {
  export type Args = {
    /** Policy ID. */
    policyId: bigint
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = {
    /** Admin address. */
    admin: Address.Address
    /** Policy type. */
    type: PolicyType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `policyData` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [args.policyId],
      functionName: 'policyData',
    })
  }
}
