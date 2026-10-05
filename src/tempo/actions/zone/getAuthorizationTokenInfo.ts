import { Hex } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'

/**
 * Returns the authenticated account address and authorization token expiry.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const info = await Actions.zone.getAuthorizationTokenInfo(client, {})
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Authorization token info.
 */
export async function getAuthorizationTokenInfo<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getAuthorizationTokenInfo.Options = {},
): Promise<getAuthorizationTokenInfo.ReturnType> {
  void options
  const info = (await client.request({
    method: 'zone_getAuthorizationTokenInfo',
    params: [],
  })) as getAuthorizationTokenInfo.RpcReturnType
  return { account: info.account, expiresAt: Hex.toBigInt(info.expiresAt) }
}

export namespace getAuthorizationTokenInfo {
  export type Options = Record<string, never>
  export type RpcReturnType = {
    /** Account address. */
    account: Address.Address
    /** Token expiry as a hex unix timestamp. */
    expiresAt: Hex.Hex
  }
  export type ReturnType = {
    /** Account address. */
    account: Address.Address
    /** Token expiry as a unix timestamp. */
    expiresAt: bigint
  }
  export type ErrorType = Errors.GlobalErrorType
}
