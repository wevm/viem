import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'

export type GetCodeParameters = {
  address: Address
} & (
  | {
      blockNumber?: undefined
      blockTag?: BlockTag | undefined
    }
  | {
      blockNumber?: bigint | undefined
      blockTag?: undefined
    }
)

export type GetCodeReturnType = Hex | undefined

export type GetCodeErrorType =
  | NumberToHexErrorType
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
export async function getCode<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  { address, blockNumber, blockTag = 'latest' }: GetCodeParameters,
): Promise<GetCodeReturnType> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined
  const hex = await client.request(
    {
      method: 'eth_getCode',
      params: [address, blockNumberHex || blockTag],
    },
    { dedupe: Boolean(blockNumberHex) },
  )
  if (hex === '0x') return undefined
  return hex
}
