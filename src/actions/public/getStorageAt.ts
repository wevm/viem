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

export type GetStorageAtParameters = {
  address: Address
  slot: Hex
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
      /** The storage value at a block specified by block hash. */
      blockHash: Hash
      /** Whether or not to throw an error if the block is not in the canonical chain. Only allowed in conjunction with `blockHash`. */
      requireCanonical?: boolean | undefined
    }
)

export type GetStorageAtReturnType = Hex | undefined

export type GetStorageAtErrorType =
  | FormatBlockParameterErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns the value from a storage slot at a given address.
 *
 * - Docs: https://viem.sh/docs/contract/getStorageAt
 * - JSON-RPC Methods: [`eth_getStorageAt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat)
 *
 * @param client - Client to use
 * @param parameters - {@link GetStorageAtParameters}
 * @returns The value of the storage slot. {@link GetStorageAtReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getStorageAt } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const code = await getStorageAt(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   slot: toHex(0),
 * })
 */
export async function getStorageAt<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    address,
    blockHash,
    blockNumber,
    blockTag = 'latest',
    requireCanonical,
    slot,
  }: GetStorageAtParameters,
): Promise<GetStorageAtReturnType> {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical,
  })
  const data = await client.request({
    method: 'eth_getStorageAt',
    params: [address, slot, block],
  })
  return data
}
