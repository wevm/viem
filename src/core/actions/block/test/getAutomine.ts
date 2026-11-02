import type { Errors } from 'ox'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Returns the automatic mining status of the node.
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
 * const isAutomining = await Actions.block.getAutomine(client)
 * ```
 */
export async function getAutomine(
  client: Client.Client,
  options: getAutomine.Options = {},
): Promise<getAutomine.ReturnType> {
  const { mode = 'anvil' } = options
  if (mode === 'ganache') return await request(client)({ method: 'eth_mining' })
  return await request(client)({ method: `${mode}_getAutomine` })
}

export declare namespace getAutomine {
  type Options = {
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ReturnType = boolean
  type ErrorType = Errors.GlobalErrorType
}
