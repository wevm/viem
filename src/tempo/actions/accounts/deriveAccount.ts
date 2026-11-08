import type { Address, Errors, Hex } from 'ox'
import { AccountConfig } from 'ox/tempo'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type * as TempoErrors from '../../errors.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall, read } from '../../internal/utils.js'

/**
 * Derives a configurable account address from an initial config with the
 * configurable account precompile.
 *
 * The precompile validates the config and derives the address from it. To
 * derive the address locally, use `Account.fromConfig({ address: 'infer' })`.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const address = await Actions.accounts.deriveAccount(client, {
 *   owners: [{ owner: '0x...', weight: 1 }],
 *   threshold: 1,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The configurable account address.
 */
export async function deriveAccount<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: deriveAccount.Options,
): Promise<deriveAccount.ReturnType> {
  const { owners, salt, threshold, ...rest } = parameters
  return read(client, {
    ...rest,
    ...deriveAccount.call({ owners, salt, threshold }),
  })
}

export namespace deriveAccount {
  export type Options = ReadParameters & Args

  export type Args = {
    /** Weighted owners. Normalized into canonical address order. */
    owners: AccountConfig.Config['owners']
    /** Caller-chosen 32-byte salt. Defaults to the zero salt. */
    salt?: Hex.Hex | undefined
    /** Minimum total owner weight required for authorization. */
    threshold: number
  }

  export type ReturnType = Address.Address

  export type ErrorType =
    | TempoErrors.ExecutionErrorType
    | Errors.GlobalErrorType

  /**
   * Defines a call to the `deriveAccount` function.
   *
   * Can be passed to [`multicall`](https://viem.sh/docs/contract/multicall).
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { owners, salt, threshold } = AccountConfig.from(args)
    return defineCall({
      address: Addresses.configurableAccount,
      abi: Abis.configurableAccount,
      args: [salt, threshold, owners],
      functionName: 'deriveAccount',
    })
  }
}
