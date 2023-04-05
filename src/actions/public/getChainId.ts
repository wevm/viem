import type { Client, PublicClient, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import { hexToNumber } from '../../utils'

export type GetChainIdReturnType = number

export async function getChainId<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client:
    | PublicClient<TChain>
    | WalletClient<TChain, TAccount>
    | Client<TChain>,
): Promise<GetChainIdReturnType> {
  const chainIdHex = await client.request({ method: 'eth_chainId' })
  return hexToNumber(chainIdHex)
}
