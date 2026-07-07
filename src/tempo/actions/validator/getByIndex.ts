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

/** Gets a validator address by index. */
export async function getByIndex<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getByIndex.Options,
): Promise<getByIndex.ReturnType> {
  const { index, ...rest } = options
  return read(client, {
    ...rest,
    ...getByIndex.call({ index }),
  })
}

export namespace getByIndex {
  export type Args = {
    /** Validator index. */
    index: bigint
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'validatorsArray',
    readonly [bigint]
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `validatorsArray` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [args.index],
      functionName: 'validatorsArray',
    })
  }
}
