import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall } from '../../internal/utils.js'

/** Gets the validator config owner. */
export async function getOwner<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getOwner.Options = {},
): Promise<getOwner.ReturnType> {
  return read(client, {
    ...options,
    ...getOwner.call(),
  })
}

export namespace getOwner {
  export type Options = Omit<ReadParameters, 'account'>
  export type ReturnType = read.ReturnType<typeof Abis.validatorConfig, 'owner'>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `owner` function. */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'owner',
    })
  }
}
