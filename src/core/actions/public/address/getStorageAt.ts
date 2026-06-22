import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import { z } from 'ox/zod'

import type * as Client from '../../../Client.js'
import {
  type RequireCanonicalError,
  blockParameter,
} from '../../internal/blockParameter.js'

/**
 * Returns the value from a storage slot at a given address.
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
 * const value = await Actions.address.getStorageAt(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   slot: '0x0',
 * })
 * ```
 */
export async function getStorageAt(
  client: Client.Client,
  options: getStorageAt.Options,
): Promise<getStorageAt.ReturnType> {
  const {
    address,
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    requireCanonical,
    slot,
  } = options
  return client.request({
    method: 'eth_getStorageAt',
    params: z.RpcSchema.encodeParams(z.RpcSchema.Eth, 'eth_getStorageAt', [
      address,
      slot,
      blockParameter({ blockHash, blockNumber, blockTag, requireCanonical }),
    ]),
  })
}

export declare namespace getStorageAt {
  type Options = {
    /** The contract address. */
    address: Address.Address
    /** The storage slot to read. */
    slot: Hex.Hex
  } & blockParameter.BlockOptions

  type ReturnType = Hex.Hex | undefined

  type ErrorType = RequireCanonicalError | Errors.GlobalErrorType
}
