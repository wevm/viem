import type { PublicClient, WalletClient } from '../../clients/index.js'
import { hexToNumber } from '../../utils/index.js'

export type GetChainIdReturnType = number

export async function getChainId(
  client: PublicClient | WalletClient,
): Promise<GetChainIdReturnType> {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
