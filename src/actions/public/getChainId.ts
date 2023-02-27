import type { PublicClient, WalletClient } from '../../clients'
import { hexToNumber } from '../../utils'

export type GetChainIdResponse = number

export async function getChainId(
  client: PublicClient | WalletClient,
): Promise<GetChainIdResponse> {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
