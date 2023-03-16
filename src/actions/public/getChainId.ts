import type { PublicClient, WalletClient } from '../../clients'
import type { Account } from '../../types'
import { hexToNumber } from '../../utils'

export type GetChainIdReturnType = number

export async function getChainId<TAccount extends Account | undefined>(
  client: PublicClient<any, any> | WalletClient<any, any, TAccount>,
): Promise<GetChainIdReturnType> {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
