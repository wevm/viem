import type { Client, PublicClient, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'

export type GetGasPriceReturnType = bigint

/**
 * @description Returns the current price of gas (in wei).
 */
export async function getGasPrice<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client:
    | PublicClient<TChain>
    | WalletClient<TChain, TAccount>
    | Client<TChain>,
): Promise<GetGasPriceReturnType> {
  const gasPrice = await client.request({
    method: 'eth_gasPrice',
  })
  return BigInt(gasPrice)
}
