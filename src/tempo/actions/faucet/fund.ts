import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'

/**
 * Funds an account with an initial amount of set tokens on Tempo's testnet.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const hashes = await Actions.faucet.fund(client, {
 *   account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hashes.
 */
export async function fund<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: fund.Options,
): Promise<fund.ReturnType> {
  const { account } = options
  const address = typeof account === 'string' ? account : account.address
  return client.request({
    method: 'tempo_fundAddress',
    params: [address],
  }) as Promise<fund.ReturnType>
}

export namespace fund {
  export type Options = {
    /** Account to fund. */
    account: Account.Account | Address.Address
  }
  export type ReturnType = readonly Hex.Hex[]
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
