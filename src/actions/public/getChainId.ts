import type { PublicClientArg, WalletClientArg } from '../../clients'
import { hexToNumber } from '../../utils'

export type GetChainIdReturnType = number

export async function getChainId(
  client: PublicClientArg | WalletClientArg,
): Promise<GetChainIdReturnType> {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
