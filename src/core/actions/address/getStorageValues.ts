import type { Address, Errors, Hex } from 'ox'

import type * as Client from '../../Client.js'
import {
  type RequireCanonicalError,
  blockParameter,
} from '../internal/blockParameter.js'

/**
 * Returns the values from storage slots at multiple addresses.
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
 * const value = await Actions.address.getStorageValues(client, {
 *   requests: { '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2': ['0x0'] },
 * })
 * ```
 */
export async function getStorageValues(
  client: Client.Client,
  options: getStorageValues.Options,
): Promise<getStorageValues.ReturnType> {
  const {
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    requireCanonical,
    requests,
  } = options
  return client.request({
    method: 'eth_getStorageValues',
    params: [
      requests,
      blockParameter({ blockHash, blockNumber, blockTag, requireCanonical }),
    ],
  })
}

export declare namespace getStorageValues {
  type Options = {
    /** Contract addresses mapped to the storage slots to read. */
    requests: Record<Address.Address, readonly Hex.Hex[]>
  } & blockParameter.BlockOptions

  type ReturnType = Record<Address.Address, Hex.Hex[]>

  type ErrorType = RequireCanonicalError | Errors.GlobalErrorType
}
