import type { Address } from '../../../accounts/index.js'
import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { withCache } from '../../../utils/promise/withCache.js'
import { abi, executionMode } from '../constants.js'

export type SupportsExecutionModeParameters = {
  address: Address
  mode?: 'default' | 'opData' | 'batchOfBatches' | Hex
}

export type SupportsExecutionModeReturnType = boolean

export type SupportsExecutionModeErrorType = ErrorType

const toSerializedMode = {
  default: executionMode.default,
  opData: executionMode.opData,
  batchOfBatches: executionMode.batchOfBatches,
} as const

/**
 * Checks if the contract supports the ERC-7821 execution mode.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { supportsExecutionMode } from 'viem/experimental/erc7821'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const supported = await supportsExecutionMode(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 * })
 * ```
 *
 * @param client - Client to use.
 * @param parameters - {@link SupportsExecutionModeParameters}
 * @returns If the execution mode is supported. {@link SupportsExecutionModeReturnType}
 */
export async function supportsExecutionMode<
  chain extends Chain | undefined = Chain | undefined,
>(
  client: Client<Transport, chain>,
  parameters: SupportsExecutionModeParameters,
): Promise<SupportsExecutionModeReturnType> {
  const { address, mode: m = 'default' } = parameters
  const mode = m.startsWith('0x') ? m : (toSerializedMode as any)[m]
  try {
    return await withCache(
      () =>
        readContract(client, {
          abi,
          address,
          functionName: 'supportsExecutionMode',
          args: [mode],
        }),
      {
        cacheKey: `supportsExecutionMode.${address}.${mode}`,
      },
    )
  } catch {
    return false
  }
}
