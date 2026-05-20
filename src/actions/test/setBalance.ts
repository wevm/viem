import type * as Address from 'ox/Address'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import {
  type Options as ModeOptions,
  getMode,
  getModeMethod,
} from './internal/mode.js'
import { request } from './internal/schema.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Sets an account balance.
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
 * await actions.setBalance(client, {
 *   address: '0x0000000000000000000000000000000000000000',
 *   value: 1_000_000_000_000_000_000n
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 */
export async function setBalance<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: setBalance.Options,
): setBalance.ReturnType {
  const mode = getMode(options.mode)
  if (mode === 'ganache') {
    await request(client, {
      method: 'evm_setAccountBalance',
      params: [options.address, toQuantity(options.value)],
    })
    return
  }
  await request(client, {
    method: getModeMethod(mode, 'setBalance'),
    params: [options.address, toQuantity(options.value)],
  })
}

export declare namespace setBalance {
  type Options = ModeOptions & {
    /** Account address. */
    address: Address.Address
    /** Balance in wei. */
    value: Quantity
  }

  type ReturnType = Promise<void>

  type ErrorType =
    | getMode.ErrorType
    | getModeMethod.ErrorType
    | toQuantity.ErrorType
}
