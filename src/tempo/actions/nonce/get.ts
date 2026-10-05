import type { Address, Errors } from 'ox'

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
 * Gets the nonce for an account and nonce key (2D nonces, TIP-1009).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const nonce = await Actions.nonce.get(client, {
 *   account: '0x…',
 *   nonceKey: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The nonce value.
 */
export async function get<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: get.Options,
): Promise<get.ReturnType> {
  const { account, nonceKey, ...rest } = options
  return read(client, {
    ...rest,
    ...get.call(client, { account, nonceKey }),
  })
}

export namespace get {
  export type Args = {
    /** Account (or address) to read the nonce of. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** Nonce key (must be > 0; key 0 is reserved for protocol nonces). */
    nonceKey: bigint
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = bigint
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `getNonce` function.
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
      abi: Abis.nonce,
      address: Addresses.nonceManager,
      args: [address, args.nonceKey],
      functionName: 'getNonce',
    })
  }
}
