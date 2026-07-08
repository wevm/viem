import type { Address, Errors } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import type { AccessKeyAccount } from '../../Account.js'
import * as Addresses from '../../Addresses.js'
import * as Hardfork from '../../Hardfork.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'
import { resolveAccessKeyAddress } from './internal.js'

/**
 * Gets the remaining spending limit for a key-token pair.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const { remaining, periodEnd } = await Actions.accessKey.getRemainingLimit(
 *   client,
 *   {
 *     account: '0x…',
 *     accessKey: '0x…',
 *     token: '0x…',
 *   },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The remaining spending amount and period end timestamp.
 */
export async function getRemainingLimit<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getRemainingLimit.Options,
): Promise<getRemainingLimit.ReturnType> {
  const { accessKey, account, token, ...rest } = options

  // TODO: remove pre-t3 branch once mainnet is on t3.
  const hardfork = (client.chain as { hardfork?: string } | undefined)?.hardfork
  if (hardfork && Hardfork.lt(hardfork, 't3')) {
    const remaining = await read(client, {
      ...rest,
      ...getRemainingLimit.call(client, { accessKey, account, token }),
    })
    return { periodEnd: undefined, remaining }
  }

  const [remaining, periodEnd] = await read(client, {
    ...rest,
    ...getRemainingLimit.callWithPeriod(client, { accessKey, account, token }),
  })
  return { periodEnd, remaining }
}

export namespace getRemainingLimit {
  export type Args = {
    /** Access key to read the limit of. */
    accessKey: Address.Address | AccessKeyAccount
    /** Account (or address) that owns the key. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** Token address. */
    token: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = {
    /** End of the current period, or `undefined` for non-periodic limits. */
    periodEnd: bigint | undefined
    /** Remaining spending amount. */
    remaining: bigint
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `getRemainingLimit` function (pre-T3).
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
      args: [address, resolveAccessKeyAddress(args.accessKey), args.token],
      functionName: 'getRemainingLimit',
    })
  }

  /**
   * Defines a call to the `getRemainingLimitWithPeriod` function (T3+).
   *
   * Can be passed to any action that accepts a contract call. `account`
   * defaults to the client's account when a client is provided.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function callWithPeriod<
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
      args: [address, resolveAccessKeyAddress(args.accessKey), args.token],
      functionName: 'getRemainingLimitWithPeriod',
    })
  }
}
