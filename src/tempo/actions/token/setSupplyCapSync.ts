import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { setSupplyCap } from './setSupplyCap.js'

/**
 * Sets the supply cap for a TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.setSupplyCapSync(client, {
 *   supplyCap: 1_000_000n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setSupplyCapSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setSupplyCapSync.Options,
): Promise<setSupplyCapSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await setSupplyCap.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = setSupplyCap.extractEvent(receipt.logs)
  return {
    ...args,

    receipt,
  } as never
}

export namespace setSupplyCapSync {
  export type Args = setSupplyCap.Args
  export type Options = setSupplyCap.Options
  export type ReturnType = {
    /** Address that updated the supply cap. */
    updater: Address.Address
    /** New supply cap. */
    newSupplyCap: bigint

    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
