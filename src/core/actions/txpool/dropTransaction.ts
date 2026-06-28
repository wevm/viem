import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import type * as Mode from '../internal/test/mode.js'
import { request } from '../internal/test/request.js'

/**
 * Removes a transaction from the mempool.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * await Actions.test.txpool.dropTransaction(client, {
 *   hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364',
 * })
 * ```
 */
export async function dropTransaction(
  client: Client.Client,
  options: dropTransaction.Options,
): Promise<void> {
  const { hash, mode = 'anvil' } = options
  await request(client)({
    method: `${mode}_dropTransaction`,
    params: [hash],
  })
}

export declare namespace dropTransaction {
  type Options = {
    /** The hash of the transaction to drop. */
    hash: Hex.Hex
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
