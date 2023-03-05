import type { PublicClient, WalletClient } from '../../clients'
import { hexToNumber } from '../../utils'

export type GetChainIdReturnType = number

export async function getChainId(
  client: PublicClient | WalletClient,
): Promise<GetChainIdReturnType> {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
