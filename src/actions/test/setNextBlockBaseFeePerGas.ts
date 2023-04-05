import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'
import { numberToHex } from '../../utils'

export type SetNextBlockBaseFeePerGasParameters = {
  /** Base fee per gas (in wei). */
  baseFeePerGas: bigint
}

export async function setNextBlockBaseFeePerGas<
  TChain extends Chain | undefined,
>(
  client: TestClient<TestClientMode, TChain>,
  { baseFeePerGas }: SetNextBlockBaseFeePerGasParameters,
) {
  return await client.request({
    method: `${client.mode}_setNextBlockBaseFeePerGas`,
    params: [numberToHex(baseFeePerGas)],
  })
}
