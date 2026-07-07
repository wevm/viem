import type * as Errors from 'ox/Errors'
import * as TokenRole from 'ox/tempo/TokenRole'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import type { ReadParameters, TokenParameter } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Gets the admin role for a specific role in a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const adminRole = await Actions.token.getRoleAdmin(client, {
 *   role: 'issuer',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The admin role hash.
 */
export async function getRoleAdmin<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getRoleAdmin.Options,
): Promise<getRoleAdmin.ReturnType> {
  return read(client, {
    ...options,
    ...getRoleAdmin.call(client, options),
  })
}

export namespace getRoleAdmin {
  export type Args = {
    /** Role to get admin for. */
    role: TokenRole.TokenRole
  } & TokenParameter
  export type Options = ReadParameters & Args
  export type ReturnType = read.ReturnType<typeof Abis.tip20, 'getRoleAdmin'>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `getRoleAdmin` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a TIP-20 token id or a contract
   * `address`.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role)],
      functionName: 'getRoleAdmin',
    })
  }
}
