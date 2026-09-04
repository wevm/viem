import type { Address, Errors, Hex } from 'ox'

import * as Account from '../../../core/Account.js'
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

/**
 * Checks whether a key-authorization witness has been burned for an account.
 *
 * [TIP-1053](https://tips.sh/1053)
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const isBurned = await Actions.accessKey.isWitnessBurned(client, {
 *   account: '0x…',
 *   witness: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Whether the witness has been burned.
 */
export async function isWitnessBurned<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: isWitnessBurned.Options,
): Promise<isWitnessBurned.ReturnType> {
  const { account, witness, ...rest } = options
  return read(client, {
    ...rest,
    ...isWitnessBurned.call(client, { account, witness }),
  })
}

export namespace isWitnessBurned {
  export type Args = {
    /** Account (or address) to check the witness on. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** The 32-byte witness to check. */
    witness: Hex.Hex
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = boolean
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `isKeyAuthorizationWitnessBurned` function.
   *
   * Can be passed to any action that accepts a contract call. `account`
   * defaults to the client's account when a client is provided.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(...parameters: CallParameters<Args, Client.Client<chain, account>>) {
    const [client, args] = resolveCallParameters(parameters)
    const account_ = args.account ?? client?.account
    if (!account_) throw new Account.NotFoundError()
    const address = typeof account_ === 'string' ? account_ : account_.address
    return defineCall({
      abi: Abis.accountKeychain,
      address: Addresses.accountKeychain,
      args: [address, args.witness],
      functionName: 'isKeyAuthorizationWitnessBurned',
    })
  }
}
