import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetMinGasPriceParameters = {
  /** The gas price. */
  gasPrice: bigint
}

export async function setMinGasPrice<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { gasPrice }: SetMinGasPriceParameters,
) {
  return await client.request({
    method: `${client.mode}_setMinGasPrice`,
    params: [numberToHex(gasPrice)],
  })
}
