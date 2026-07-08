import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall } from '../../internal/utils.js'

const zeroAddress = '0x0000000000000000000000000000000000000000'

/**
 * Gets the master address for a given master ID.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const address = await Actions.virtualAddress.getMasterAddress(client, {
 *   masterId: '0xdeadbeef',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The master address, or null if unregistered.
 */
export async function getMasterAddress<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getMasterAddress.Options,
): Promise<getMasterAddress.ReturnType> {
  const address = await read(client, {
    ...options,
    ...getMasterAddress.call({ masterId: options.masterId }),
  })
  if (address === zeroAddress) return null
  return address
}

export namespace getMasterAddress {
  export type Args = {
    /** Master ID (bytes4). */
    masterId: Hex.Hex
  }
  export type Options = ReadParameters & Args
  export type ReturnType = Address.Address | null
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `getMaster` function. */
  export function call(args: Args) {
    const { masterId } = args
    return defineCall({
      abi: Abis.addressRegistry,
      address: Addresses.addressRegistry,
      args: [masterId],
      functionName: 'getMaster',
    })
  }
}
