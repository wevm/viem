import type {
  PublicClient,
  Transport,
  WalletClient,
} from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'
import { hexToNumber } from '../../utils/index.js'

export type GetChainIdReturnType = number

/**
 * Returns the chain ID associated with the current network.
 *
 * - Docs: https://viem.sh/docs/actions/public/getChainId.html
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
>(
  client:
    | PublicClient<Transport, TChain>
    | WalletClient<Transport, TChain, TAccount>,
): Promise<GetChainIdReturnType> {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
