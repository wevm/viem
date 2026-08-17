import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { WriteSyncParameters } from '../../internal/types.js'
import { burnWitness } from './burnWitness.js'

/**
 * Burns a key-authorization witness, and waits for the transaction to be
 * confirmed.
 *
 * [TIP-1053](https://tips.sh/1053)
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
 * const { witness } = await Actions.accessKey.burnWitnessSync(client, {
 *   witness: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function burnWitnessSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnWitnessSync.Options,
): Promise<burnWitnessSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await burnWitness.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = burnWitness.extractEvent(receipt.logs)
  return { ...args, receipt }
}

export namespace burnWitnessSync {
  export type Args = burnWitness.Args
  export type Options = burnWitness.Options & WriteSyncParameters
  export type ReturnType = {
    /** Account the witness was burned on. */
    account: Address.Address
    /** The burned witness. */
    witness: Hex.Hex
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
