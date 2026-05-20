import type * as Address from 'ox/Address'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { request } from './internal/request.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Sets an account nonce.
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
 * await actions.setNonce(client, {
 *   address: '0x0000000000000000000000000000000000000000',
 *   nonce: 42n,
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
  await request(client, {
    method: 'anvil_setNonce',
    params: [options.address, toQuantity(options.nonce)],
  })
}

export declare namespace setNonce {
  type Options = {
    /** Account address. */
    address: Address.Address
    /** Nonce. */
    nonce: Quantity
  }

  type ReturnType = Promise<void>

  type ErrorType = toQuantity.ErrorType
}
