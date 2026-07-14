import { Hex } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../../Client.js'
import type * as Mode from '../../internal/test/mode.js'
import { request } from '../../internal/test/request.js'

/**
 * Mine a specified number of blocks.
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
 * await Actions.block.mine(client, { blocks: 1 })
 * ```
 */
export async function mine(
  client: Client.Client,
  options: mine.Options,
): Promise<void> {
  const { blocks, interval = 0, mode = 'anvil' } = options
  if (mode === 'ganache')
    await request(client)({
      method: 'evm_mine',
      params: [{ blocks: Hex.fromNumber(blocks) }],
    })
  else
    await request(client)({
      method: `${mode}_mine`,
      params: [Hex.fromNumber(blocks), Hex.fromNumber(interval)],
    })
}

export declare namespace mine {
  type Options = {
    /** Number of blocks to mine. */
    blocks: number
    /** Interval between each block in seconds. @default 0 */
    interval?: number | undefined
    /** Test node mode. @default 'anvil' */
    mode?: Mode.Mode | undefined
  }
  type ErrorType = Errors.GlobalErrorType
}
