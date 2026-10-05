import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall } from '../../internal/utils.js'

/** Gets the next epoch for a full DKG ceremony. */
export async function getNextFullDkgCeremony<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getNextFullDkgCeremony.Options = {},
): Promise<getNextFullDkgCeremony.ReturnType> {
  return read(client, {
    ...options,
    ...getNextFullDkgCeremony.call(),
  })
}

export namespace getNextFullDkgCeremony {
  export type Options = Omit<ReadParameters, 'account'>
  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'getNextFullDkgCeremony'
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `getNextFullDkgCeremony` function. */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'getNextFullDkgCeremony',
    })
  }
}
