import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type SetNextBlockBaseFeePerGasParameters = {
  /** Base fee per gas (in wei). */
  baseFeePerGas: bigint
}

export async function setNextBlockBaseFeePerGas(
  client: TestClient,
  { baseFeePerGas }: SetNextBlockBaseFeePerGasParameters,
) {
  return await client.request({
    method: `${client.mode}_setNextBlockBaseFeePerGas`,
    params: [numberToHex(baseFeePerGas)],
  })
}
