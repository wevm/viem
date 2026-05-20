import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { type Options as ModeOptions, getMode } from './internal/mode.js'
import { request } from './internal/schema.js'

/**
 * Sets interval mining.
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
 * await actions.setIntervalMining(client, { interval: 1 })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Nothing.
 */
export async function setIntervalMining<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: setIntervalMining.Options,
): setIntervalMining.ReturnType {
  const mode = getMode(options.mode)
  const interval =
    mode === 'hardhat' ? options.interval * 1000 : options.interval
  await request(client, {
    method: 'evm_setIntervalMining',
    params: [interval],
  })
}

export declare namespace setIntervalMining {
  type Options = ModeOptions & {
    /** Mining interval, in seconds. */
    interval: number
  }

  type ReturnType = Promise<void>

  type ErrorType = getMode.ErrorType
}
