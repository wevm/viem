import type { Address, Errors, Hex } from 'ox'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type * as TempoErrors from '../../errors.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall, read } from '../../internal/utils.js'

/**
 * Verifies a configurable account signature against the account's current
 * configuration with the signature verifier precompile.
 *
 * Returns `false` when the signature is for another account or a config that
 * is not the account's current config. Throws when the signature is malformed
 * or its approvals do not reach quorum.
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
 * const valid = await Actions.accounts.verifyHash(client, {
 *   account: '0x...',
 *   hash: '0x...',
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the signature is valid for the account.
 */
export async function verifyHash<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: verifyHash.Options,
): Promise<verifyHash.ReturnType> {
  const { account, hash, signature, ...rest } = parameters
  return read(client, {
    ...rest,
    ...verifyHash.call({ account, hash, signature }),
  })
}

export namespace verifyHash {
  export type Options = Omit<ReadParameters, 'account'> & Args

  export type Args = {
    /** Configurable account address the signature is expected to belong to. */
    account: Address.Address
    /** Original message hash that was signed. */
    hash: Hex.Hex
    /** Configurable account signature envelope. */
    signature: Hex.Hex
  }

  export type ReturnType = boolean

  export type ErrorType =
    | TempoErrors.ExecutionErrorType
    | Errors.GlobalErrorType

  /**
   * Defines a call to the `verifyConfigurableAccount` function on the
   * signature verifier precompile.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, hash, signature } = args
    return defineCall({
      address: Addresses.signatureVerifier,
      abi: Abis.signatureVerifier,
      args: [account, hash, signature],
      functionName: 'verifyConfigurableAccount',
    })
  }
}
