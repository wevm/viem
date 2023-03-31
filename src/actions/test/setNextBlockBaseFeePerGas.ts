import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetNextBlockBaseFeePerGasParameters = {
  /** Base fee per gas (in wei). */
  baseFeePerGas: bigint
}

export async function setNextBlockBaseFeePerGas<
  TChain extends Chain | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { baseFeePerGas }: SetNextBlockBaseFeePerGasParameters,
) {
  return await client.request({
    method: `${client.mode}_setNextBlockBaseFeePerGas`,
    params: [numberToHex(baseFeePerGas)],
  })
}
