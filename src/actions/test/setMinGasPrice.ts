import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type SetMinGasPriceParameters = {
  /** The gas price. */
  gasPrice: bigint
}

export async function setMinGasPrice(
  client: TestClient,
  { gasPrice }: SetMinGasPriceParameters,
) {
  return await client.request({
    method: `${client.mode}_setMinGasPrice`,
    params: [numberToHex(gasPrice)],
  })
}
