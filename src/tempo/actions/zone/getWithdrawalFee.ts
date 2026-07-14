import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import * as ZoneAbis from '../../zones/Abis.js'

/**
 * Returns the fee required for a withdrawal from a zone, given a callback gas limit.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const fee = await Actions.zone.getWithdrawalFee(client, {})
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The withdrawal fee.
 */
export async function getWithdrawalFee<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getWithdrawalFee.Options = {},
): Promise<getWithdrawalFee.ReturnType> {
  const { callbackGas = 0n, ...rest } = options
  return read(client, {
    ...rest,
    address: Addresses.zoneOutbox,
    abi: ZoneAbis.zoneOutbox,
    functionName: 'calculateWithdrawalFee',
    args: [callbackGas],
  })
}

export namespace getWithdrawalFee {
  export type Options = ReadParameters & {
    /** Gas limit reserved for the withdrawal callback on the parent chain. */
    callbackGas?: bigint | undefined
  }
  export type ReturnType = bigint
  export type ErrorType = Errors.GlobalErrorType
}
