import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type HexToNumberErrorType,
  hexToNumber,
} from '../../utils/encoding/fromHex.js'

export type GetChainIdReturnType = number

export type GetChainIdErrorType =
  | HexToNumberErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns the chain ID associated with the current network.
 *
 * - Docs: https://viem.sh/docs/actions/public/getChainId
 * - JSON-RPC Methods: [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid)
 *
 * @param client - Client to use
 * @returns The current chain ID. {@link GetChainIdReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getChainId } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const chainId = await getChainId(client)
 * // 1
 */
export async function getChainId<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(client: Client<Transport, TChain, TAccount>): Promise<GetChainIdReturnType> {
  const chainIdHex = await client.request({
    method: 'eth_chainId',
  })
  return hexToNumber(chainIdHex)
}
