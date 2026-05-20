import type * as Address from 'ox/Address'

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
 * Sets an account nonce.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http('http://127.0.0.1:8545')
 * })
 *
 * await actions.setNonce(client, {
 *   address: '0x0000000000000000000000000000000000000000',
 *   nonce: 42n
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 */
export async function setNonce<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: setNonce.Options,
): setNonce.ReturnType {
  const mode = getMode(options.mode)
  await request(client, {
    method: getModeMethod(mode, 'setNonce'),
    params: [options.address, toQuantity(options.nonce)],
  })
}

export declare namespace setNonce {
  type Options = ModeOptions & {
    /** Account address. */
    address: Address.Address
    /** Nonce. */
    nonce: Quantity
  }

  type ReturnType = Promise<void>

  type ErrorType =
    | getMode.ErrorType
    | getModeMethod.ErrorType
    | toQuantity.ErrorType
}
