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

/** Gets validator information by address. */
export async function get<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: get.Options,
): Promise<get.ReturnType> {
  const { validator, ...rest } = options
  return read(client, {
    ...rest,
    ...get.call({ validator }),
  })
}

export namespace get {
  export type Args = {
    /** Validator address. */
    validator: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'validators',
    readonly [Address.Address]
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `validators` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [args.validator],
      functionName: 'validators',
    })
  }
}
