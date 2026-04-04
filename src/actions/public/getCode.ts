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

export type GetCodeParameters = {
  address: Address
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
      /** The bytecode at a block specified by block hash. */
      blockHash: Hash
      /** Whether or not to throw an error if the block is not in the canonical chain. Only allowed in conjunction with `blockHash`. */
      requireCanonical?: boolean | undefined
    }
)

export type GetCodeReturnType = Hex | undefined

export type GetCodeErrorType =
  | FormatBlockParameterErrorType
  | RequestErrorType
  | ErrorType

/**
 * Retrieves the bytecode at an address.
 *
 * - Docs: https://viem.sh/docs/contract/getCode
 * - JSON-RPC Methods: [`eth_getCode`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode)
 *
 * @param client - Client to use
 * @param parameters - {@link GetCodeParameters}
 * @returns The contract's bytecode. {@link GetCodeReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getCode } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const code = await getCode(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 * })
 */
export async function getCode<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    address,
    blockHash,
    blockNumber,
    blockTag = 'latest',
    requireCanonical,
  }: GetCodeParameters,
): Promise<GetCodeReturnType> {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical,
  })
  const hex = await client.request(
    {
      method: 'eth_getCode',
      params: [address, block],
    },
    {
      dedupe: typeof blockNumber === 'bigint' || blockHash !== undefined,
    },
  )
  if (hex === '0x') return undefined
  return hex
}
