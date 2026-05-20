import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { request } from './internal/request.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Sets a storage slot value.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({
 *   transport: http('http://127.0.0.1:8545'),
 * })
 *
 * await actions.setStorageAt(client, {
 *   address: '0x0000000000000000000000000000000000000000',
 *   slot: 0n,
 *   value: '0x000000000000000000000000000000000000000000000000000000000000002a',
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 */
export async function setStorageAt<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: setStorageAt.Options,
): setStorageAt.ReturnType {
  await request(client, {
    method: 'anvil_setStorageAt',
    params: [options.address, toQuantity(options.slot), options.value],
  })
}

export declare namespace setStorageAt {
  type Options = {
    /** Account address. */
    address: Address.Address
    /** Storage slot. */
    slot: Quantity
    /** Storage value. */
    value: Hex.Hex
  }

  type ReturnType = Promise<void>

  type ErrorType = toQuantity.ErrorType
}
