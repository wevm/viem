import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import {
  type Options as ModeOptions,
  getMode,
  getModeMethod,
} from './internal/mode.js'
import { request } from './internal/schema.js'

/**
 * Sets the bytecode at an account address.
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
 * await actions.setCode(client, {
 *   address: '0x0000000000000000000000000000000000000000',
 *   bytecode: '0x6001600055'
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 */
export async function setCode<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>, options: setCode.Options): setCode.ReturnType {
  const mode = getMode(options.mode)
  if (mode === 'ganache') {
    await request(client, {
      method: 'evm_setAccountCode',
      params: [options.address, options.bytecode],
    })
    return
  }
  await request(client, {
    method: getModeMethod(mode, 'setCode'),
    params: [options.address, options.bytecode],
  })
}

export declare namespace setCode {
  type Options = ModeOptions & {
    /** Account address. */
    address: Address.Address
    /** Bytecode. */
    bytecode: Hex.Hex
  }

  type ReturnType = Promise<void>

  type ErrorType = getMode.ErrorType | getModeMethod.ErrorType
}
