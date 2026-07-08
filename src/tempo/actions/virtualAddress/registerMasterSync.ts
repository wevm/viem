import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { registerMaster } from './registerMaster.js'

/**
 * Registers a virtual master address, and waits for the transaction to be confirmed.
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
 * const { receipt, masterAddress, masterId } = await Actions.virtualAddress.registerMasterSync(client, {
 *   salt: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and extracted event data.
 */
export async function registerMasterSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: registerMasterSync.Options,
): Promise<registerMasterSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await registerMaster.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = registerMaster.extractEvent(receipt.logs)
  return {
    masterAddress: args.masterAddress,
    masterId: args.masterId,
    receipt,
  }
}

export namespace registerMasterSync {
  export type Args = registerMaster.Args
  export type Options = registerMaster.Options
  export type ReturnType = {
    /** Master address. */
    masterAddress: Address.Address
    /** Master ID. */
    masterId: Hex.Hex
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
