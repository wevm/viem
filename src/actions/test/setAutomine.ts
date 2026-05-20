import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { type Options as ModeOptions, getMode } from './internal/mode.js'
import { request } from './internal/schema.js'

/**
 * Enables or disables automining.
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
 * await actions.setAutomine(client, true)
 * ```
 *
 * @param client - Client to use.
 * @param enabled - Whether automining is enabled.
 * @param options - Options.
 * @returns Nothing.
 */
export async function setAutomine<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  enabled: boolean,
  options: setAutomine.Options = {},
): setAutomine.ReturnType {
  const mode = getMode(options.mode)
  if (mode === 'ganache') {
    await request(client, {
      method: enabled ? 'miner_start' : 'miner_stop',
    })
    return
  }
  await request(client, {
    method: 'evm_setAutomine',
    params: [enabled],
  })
}

export declare namespace setAutomine {
  type Options = ModeOptions

  type ReturnType = Promise<void>

  type ErrorType = getMode.ErrorType
}
