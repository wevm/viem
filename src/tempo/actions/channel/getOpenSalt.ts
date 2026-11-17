import { Hex } from 'ox'
import type { Address, Errors } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { ReadParameters } from '../../internal/types.js'
import { getConfigCommitment } from '../accounts/getConfigCommitment.js'
import type * as TempoErrors from '../../errors.js'

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Gets the salt to open a TIP-20 channel reserve channel with for a voucher
 * signer.
 *
 * From T15 (TIP-1166), a channel whose voucher signer is a configurable account
 * (TIP-1107) with a nonzero configuration commitment must use that commitment as
 * its salt. This returns the signer's commitment when it is nonzero, else a
 * random 32-byte salt. Pass the result as `salt` to `channel.open` or
 * `channel.open.call`.
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
 * const salt = await Actions.channel.getOpenSalt(client, {
 *   signer: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The signer's nonzero configuration commitment, else a random 32-byte salt.
 */
export async function getOpenSalt<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getOpenSalt.Options,
): Promise<getOpenSalt.ReturnType> {
  const { signer, ...rest } = options
  const commitment = await getConfigCommitment(client, {
    ...rest,
    account: Account.from(signer).address,
  })
  if (commitment !== zeroHash) return commitment
  return Hex.random(32)
}

export namespace getOpenSalt {
  export type Options = Omit<ReadParameters, 'account'> & {
    /** Voucher signer: `authorizedSigner` if set, else the payer. */
    signer: Account.Account | Address.Address
  }
  export type ReturnType = Hex.Hex
  // TODO: exhaustive error type
  export type ErrorType =
    | TempoErrors.ExecutionErrorType
    | Errors.GlobalErrorType
}
