import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type * as Mode from './internal/mode.js'
import { request } from './internal/request.js'

/**
 * Enables or disables the automatic mining of new blocks with each new
 * transaction submitted to the network.
 *
 * @example
 * ```ts
 * import { Client, http, Actions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 * await Actions.test.setAutomine(client, { enabled: true })
 * ```
 */
export async function setAutomine(
  client: Client.Client,
  options: setAutomine.Options,
): Promise<void> {
  const { enabled, mode = 'anvil' } = options
  if (mode === 'ganache') {
    if (enabled) await request(client)({ method: 'miner_start' })
    else await request(client)({ method: 'miner_stop' })
  } else
    await request(client)({
      method: 'evm_setAutomine',
      params: [enabled],
    })
}

export declare namespace setAutomine {
  type Options = {
    /** Whether to enable or disable automatic mining. */
    enabled: boolean
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
