import type { TestClient } from '../../clients/index.js'
import { numberToHex } from '../../utils/index.js'

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
