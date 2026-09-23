import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import {
  type FormatBlockParameterErrorType,
  formatBlockParameter,
} from '../../utils/block/formatBlockParameter.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type GetStorageValuesParameters = {
  /** Mapping of contract addresses to storage slot keys. */
  requests: Record<Address, readonly Hex[]>
} & (
  | {
      blockNumber?: undefined
      blockTag?: BlockTag | undefined
      blockHash?: undefined
      requireCanonical?: undefined
    }
  | {
      blockNumber?: bigint | undefined
      blockTag?: undefined
      blockHash?: undefined
      requireCanonical?: undefined
    }
  | {
      blockNumber?: undefined
      blockTag?: undefined
      /** The storage values at a block specified by block hash. */
      blockHash: Hash
      /** Whether or not to throw an error if the block is not in the canonical chain. Only allowed in conjunction with `blockHash`. */
      requireCanonical?: boolean | undefined
    }
)

export type GetStorageValuesReturnType = Record<Address, Hex[]>

export type GetStorageValuesErrorType =
  | FormatBlockParameterErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns values from multiple storage slots for multiple adddresses at a given block.
 *
 * - Docs: https://viem.sh/docs/actions/public/getStorageValues
 * - JSON-RPC Methods: [`eth_getStorageValues`](https://github.com/ethereum/execution-apis/issues/752)
 *
 * @param client - Client to use
 * @param parameters - {@link GetStorageValuesParameters}
 * @returns The values of the requested storage slots. {@link GetStorageValuesReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getStorageValues } from 'viem/actions'
 *
 * const client = createPublicClient({ chain: mainnet, transport: http() })
 * const values = await getStorageValues(client, {
 *   requests: { '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2': ['0x0', '0x1'] },
 * })
 */
export async function getStorageValues<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    requireCanonical,
    requests,
  }: GetStorageValuesParameters,
): Promise<GetStorageValuesReturnType> {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical,
  })
  return client.request({
    method: 'eth_getStorageValues',
    params: [requests, block],
  })
}
