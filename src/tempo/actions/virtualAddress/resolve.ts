import { Hex } from 'ox'
import type { Address, Errors } from 'ox'
import { VirtualAddress } from 'ox/tempo'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { ReadParameters } from '../../internal/types.js'
import { getMasterAddress } from './getMasterAddress.js'

/**
 * Resolves a virtual address to its master address.
 *
 * - Non-virtual addresses are returned unchanged.
 * - Virtual addresses with a registered master return the master address.
 * - Virtual addresses with an unregistered master return null.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const recipient = await Actions.virtualAddress.resolve(client, {
 *   address: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The resolved address, or null if virtual and unregistered.
 */
export async function resolve<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: resolve.Options,
): Promise<resolve.ReturnType> {
  if (!VirtualAddress.isVirtual(options.address)) return options.address

  const masterId = Hex.slice(options.address, 0, 4)
  return getMasterAddress(client, { ...options, masterId })
}

export namespace resolve {
  export type Args = {
    /** Address to resolve. */
    address: Address.Address
  }
  export type Options = ReadParameters & Args
  export type ReturnType = Address.Address | null
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
