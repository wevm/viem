import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type SetMinGasPriceArgs = {
  /** The gas price. */
  gasPrice: bigint
}

export async function setMinGasPrice(
  client: TestClient,
  { gasPrice }: SetMinGasPriceArgs,
) {
  return await client.request({
    method: `${client.mode}_setMinGasPrice`,
    params: [numberToHex(gasPrice)],
  })
}
