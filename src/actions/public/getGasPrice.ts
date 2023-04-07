import type {
  PublicClient,
  Transport,
  WalletClient,
} from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'

export type GetGasPriceReturnType = bigint

/**
 * @description Returns the current price of gas (in wei).
 */
export async function getGasPrice<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client:
    | PublicClient<Transport, TChain>
    | WalletClient<Transport, TChain, TAccount>,
): Promise<GetGasPriceReturnType> {
  const gasPrice = await client.request({
    method: 'eth_gasPrice',
  })
  return BigInt(gasPrice)
}
