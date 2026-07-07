import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as TokenRole from 'ox/tempo/TokenRole'

import * as Account from '../../../core/Account.js'
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
 * Checks if an account has a specific role for a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hasRole = await Actions.token.hasRole(client, {
 *   role: 'issuer',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Whether the account has the role.
 */
export async function hasRole<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: hasRole.Options,
): Promise<hasRole.ReturnType> {
  const { account = client.account } = options
  if (!account) throw new Account.NotFoundError()
  const address = typeof account === 'string' ? account : account.address
  return read(client, {
    ...options,
    ...hasRole.call(client, { ...options, account: address }),
  })
}

export namespace hasRole {
  export type Args = {
    /** Account address to check. */
    account?: Account.Account | Address.Address | undefined
    /** Role to check. */
    role: TokenRole.TokenRole
  } & TokenParameter
  export type CallArgs = {
    /** Account address to check. */
    account: Account.Account | Address.Address
    /** Role to check. */
    role: TokenRole.TokenRole
  } & TokenParameter
  export type Options = ReadParameters & Args
  export type ReturnType = read.ReturnType<typeof Abis.tip20, 'hasRole'>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `hasRole` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a TIP-20 token id or a contract
   * `address`.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<CallArgs, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { account, role, token } = args
    const address = typeof account === 'string' ? account : account.address
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [address, TokenRole.serialize(role)],
      functionName: 'hasRole',
    })
  }
}
