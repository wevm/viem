import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall } from '../../internal/utils.js'

/** Gets the total number of validators. */
export async function getCount<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getCount.Options = {},
): Promise<getCount.ReturnType> {
  return read(client, {
    ...options,
    ...getCount.call(),
  })
}

export namespace getCount {
  export type Options = Omit<ReadParameters, 'account'>
  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'validatorCount'
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `validatorCount` function. */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'validatorCount',
    })
  }
}
