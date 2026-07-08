import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { changeTransferPolicy } from './changeTransferPolicy.js'

/**
 * Changes the transfer policy ID for a TIP-20 token, and waits for the
 * transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.changeTransferPolicySync(client, {
 *   policyId: 1n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function changeTransferPolicySync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeTransferPolicySync.Options,
): Promise<changeTransferPolicySync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await changeTransferPolicy.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = changeTransferPolicy.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace changeTransferPolicySync {
  export type Args = changeTransferPolicy.Args
  export type Options = changeTransferPolicy.Options
  export type ReturnType = {
    /** Address that updated the transfer policy. */
    updater: Address.Address
    /** New transfer policy ID. */
    newPolicyId: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
