import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import {
  type Options as ModeOptions,
  getMode,
  getModeMethod,
} from './internal/mode.js'
import { request } from './internal/schema.js'

/**
 * Returns whether automining is enabled.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('http://127.0.0.1:8545'),
 * })
 *
 * const enabled = await actions.getAutomine(client)
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Whether automining is enabled.
 */
export async function getAutomine<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getAutomine.Options = {},
): getAutomine.ReturnType {
  const mode = getMode(options.mode)
  return request(client, {
    method:
      mode === 'ganache' ? 'eth_mining' : getModeMethod(mode, 'getAutomine'),
  })
}

export declare namespace getAutomine {
  type Options = ModeOptions

  type ReturnType = Promise<boolean>

  type ErrorType = getMode.ErrorType | getModeMethod.ErrorType
}
