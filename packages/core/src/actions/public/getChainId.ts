import type { PublicClient } from '../../clients'
import { hexToNumber } from '../../utils'

export async function getChainId(client: PublicClient) {
  const chainIdHex = await client.request({ method: 'net_version' })
  return hexToNumber(chainIdHex)
}
