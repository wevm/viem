import type {
  PublicClient,
  Transport,
  WalletClient,
} from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'
import { hexToNumber } from '../../utils/index.js'

export type GetChainIdReturnType = number

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
