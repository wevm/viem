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

const zeroAddress = '0x0000000000000000000000000000000000000000'

/**
 * Gets a validator's preferred fee token.
 *
 * Returns `null` when the validator has no fee token preference set.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const token = await Actions.fee.getValidatorToken(client, {
 *   validator: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The validator's fee token address, or `null` if unset.
 */
export async function getValidatorToken<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getValidatorToken.Options,
): Promise<getValidatorToken.ReturnType> {
  const { validator, ...rest } = options
  const address = await read(client, {
    ...rest,
    ...getValidatorToken.call({ validator }),
  })
  if (address === zeroAddress) return null
  return address
}

export namespace getValidatorToken {
  export type Args = {
    /** Validator address. */
    validator: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = Address.Address | null
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `validatorTokens` function.
   *
   * Can be passed to any action that accepts a contract call.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.feeManager,
      address: Addresses.feeManager,
      args: [args.validator],
      functionName: 'validatorTokens',
    })
  }
}
