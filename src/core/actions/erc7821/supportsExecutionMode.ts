import { Hex } from 'ox'
import type { Address, Errors } from 'ox'
import { Execute } from 'ox/erc7821'

import type * as Client from '../../Client.js'
import { read } from '../contract/read.js'
import { withCache } from '../internal/withCache.js'

const abi = [
  {
    inputs: [{ name: 'mode', type: 'bytes32' }],
    name: 'supportsExecutionMode',
    outputs: [{ name: 'result', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Checks if a contract supports an [ERC-7821](https://eips.ethereum.org/EIPS/eip-7821)
 * execution mode. Results are cached per client, address, and mode.
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
 * const supported = await Actions.erc7821.supportsExecutionMode(client, {
 *   address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 * })
 * ```
 */
export async function supportsExecutionMode(
  client: Client.Client,
  options: supportsExecutionMode.Options,
): Promise<supportsExecutionMode.ReturnType> {
  const { address, mode = 'default' } = options
  const mode_ = Hex.validate(mode) ? mode : Execute.mode[mode]
  try {
    return await withCache(
      () =>
        read(client, {
          abi,
          address,
          args: [mode_],
          functionName: 'supportsExecutionMode',
        }),
      { cacheKey: `supportsExecutionMode.${client.uid}.${address}.${mode_}` },
    )
  } catch {
    return false
  }
}

export declare namespace supportsExecutionMode {
  type Options = {
    /** Address of the contract to check. */
    address: Address.Address
    /** Execution mode to check support for. @default 'default' */
    mode?: keyof typeof Execute.mode | Hex.Hex | undefined
  }

  type ReturnType = boolean

  type ErrorType = Errors.GlobalErrorType
}
