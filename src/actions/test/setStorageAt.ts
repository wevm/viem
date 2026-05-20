import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import {
  type Options as ModeOptions,
  getMode,
  getModeMethod,
} from './internal/mode.js'
import { request } from './internal/schema.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Sets a storage slot value.
 *
 * @example
 * ```ts twoslash
 * import { Client, actions, http } from 'viem'
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
  const mode = getMode(options.mode)
  await request(client, {
    method: getModeMethod(mode, 'setStorageAt'),
    params: [options.address, toQuantity(options.slot), options.value],
  })
}

export declare namespace setStorageAt {
  type Options = ModeOptions & {
    /** Account address. */
    address: Address.Address
    /** Storage slot. */
    slot: Quantity
    /** Storage value. */
    value: Hex.Hex
  }

  type ReturnType = Promise<void>

  type ErrorType =
    | getMode.ErrorType
    | getModeMethod.ErrorType
    | toQuantity.ErrorType
}
