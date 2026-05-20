import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import {
  type Options as ModeOptions,
  getMode,
  getModeMethod,
} from './internal/mode.js'
import { request } from './internal/schema.js'

/**
 * Sets the timestamp interval for each mined block.
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
 * await actions.setBlockTimestampInterval(client, {
 *   interval: 12
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Nothing.
 */
export async function setBlockTimestampInterval<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: setBlockTimestampInterval.Options,
): setBlockTimestampInterval.ReturnType {
  const mode = getMode(options.mode)
  const interval =
    mode === 'hardhat' ? options.interval * 1000 : options.interval
  await request(client, {
    method: getModeMethod(mode, 'setBlockTimestampInterval'),
    params: [interval],
  })
}

export declare namespace setBlockTimestampInterval {
  type Options = ModeOptions & {
    /** Timestamp interval, in seconds. */
    interval: number
  }

  type ReturnType = Promise<void>

  type ErrorType = getMode.ErrorType | getModeMethod.ErrorType
}
