import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { unpause } from './unpause.js'

/**
 * Unpauses a TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.unpauseSync(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function unpauseSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: unpauseSync.Options,
): Promise<unpauseSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await unpause.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = unpause.extractEvent(receipt.logs)
  return {
    ...args,

    receipt,
  }
}

export namespace unpauseSync {
  export type Args = unpause.Args
  export type Options = unpause.Options & WriteSyncParameters
  export type ReturnType = {
    /** Address that updated the pause state. */
    updater: Address.Address
    /** Whether the token is paused. */
    isPaused: boolean

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
