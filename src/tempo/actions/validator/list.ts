import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall, read } from '../../internal/utils.js'
import type * as TempoErrors from '../../errors.js'

/** Gets the complete set of validators. */
export async function list<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: list.Options = {},
): Promise<list.ReturnType> {
  return read(client, {
    ...options,
    ...list.call(),
  })
}

export namespace list {
  export type Options = Omit<ReadParameters, 'account'>
  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'getValidators'
  >
  // TODO: exhaustive error type
  export type ErrorType =
    | TempoErrors.ExecutionErrorType
    | Errors.GlobalErrorType

  /** Defines a call to the `getValidators` function. */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'getValidators',
    })
  }
}
