import type { PublicClient, WalletClient } from '../../clients/index.js'

export type GetGasPriceReturnType = bigint

/**
 * @description Returns the current price of gas (in wei).
 */
export async function getGasPrice(
  client: PublicClient | WalletClient,
): Promise<GetGasPriceReturnType> {
  const gasPrice = await client.request({
    method: 'eth_gasPrice',
  })
  return BigInt(gasPrice)
}
