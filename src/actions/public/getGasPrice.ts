import type { PublicClient, WalletClient } from '../../clients'
import type { Account } from '../../types'

export type GetGasPriceReturnType = bigint

/**
 * @description Returns the current price of gas (in wei).
 */
export async function getGasPrice<TAccount extends Account | undefined>(
  client: PublicClient | WalletClient<any, any, TAccount>,
): Promise<GetGasPriceReturnType> {
  const gasPrice = await client.request({
    method: 'eth_gasPrice',
  })
  return BigInt(gasPrice)
}
