import type { PublicClientArg, WalletClientArg } from '../../clients'

export type GetGasPriceReturnType = bigint

/**
 * @description Returns the current price of gas (in wei).
 */
export async function getGasPrice(
  client: PublicClientArg | WalletClientArg,
): Promise<GetGasPriceReturnType> {
  const gasPrice = await client.request({
    method: 'eth_gasPrice',
  })
  return BigInt(gasPrice)
}
