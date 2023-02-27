import type { PublicClient, WalletClient } from '../../clients'

export type GetGasPriceResponse = bigint

/**
 * @description Returns the current price of gas (in wei).
 */
export async function getGasPrice(
  client: PublicClient | WalletClient,
): Promise<GetGasPriceResponse> {
  const gasPrice = await client.request({
    method: 'eth_gasPrice',
  })
  return BigInt(gasPrice)
}
