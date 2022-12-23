import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type SetNextBlockBaseFeePerGasArgs = {
  /** Base fee per gas (in wei). */
  baseFeePerGas: bigint
}

export async function setNextBlockBaseFeePerGas(
  client: TestClient,
  { baseFeePerGas }: SetNextBlockBaseFeePerGasArgs,
) {
  return await client.request({
    method: `${client.mode}_setNextBlockBaseFeePerGas`,
    params: [numberToHex(baseFeePerGas)],
  })
}
