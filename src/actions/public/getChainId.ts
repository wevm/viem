import type { PublicClient } from '../../clients'
import { hexToNumber } from '../../utils'

export async function getChainId(client: PublicClient) {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
