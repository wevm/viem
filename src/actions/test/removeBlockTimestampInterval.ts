import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import {
  type Options as ModeOptions,
  getMode,
  getModeMethod,
} from './internal/mode.js'
import { request } from './internal/schema.js'

/**
 * Removes the configured block timestamp interval.
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
 * await actions.removeBlockTimestampInterval(client)
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Nothing.
 */
export async function removeBlockTimestampInterval<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: removeBlockTimestampInterval.Options = {},
): removeBlockTimestampInterval.ReturnType {
  const mode = getMode(options.mode)
  await request(client, {
    method: getModeMethod(mode, 'removeBlockTimestampInterval'),
  })
}

export declare namespace removeBlockTimestampInterval {
  type Options = ModeOptions

  type ReturnType = Promise<void>

  type ErrorType = getMode.ErrorType | getModeMethod.ErrorType
}
