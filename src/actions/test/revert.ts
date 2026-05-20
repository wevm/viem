import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { request } from './internal/request.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Reverts the chain state to a previous snapshot.
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
 * const id = await actions.snapshot(client)
 * await actions.revert(client, { id })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 */
export async function revert<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>, options: revert.Options): revert.ReturnType {
  await request(client, {
    method: 'evm_revert',
    params: [toQuantity(options.id)],
  })
}

export declare namespace revert {
  type Options = {
    /** Snapshot ID. */
    id: Quantity
  }

  type ReturnType = Promise<void>

  type ErrorType = toQuantity.ErrorType
}
