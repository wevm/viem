import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type SetBlockGasLimitArgs = {
  /** Gas limit (in wei). */
  gasLimit: bigint
}

export async function setBlockGasLimit(
  client: TestClient,
  { gasLimit }: SetBlockGasLimitArgs,
) {
  return await client.request({
    method: 'evm_setBlockGasLimit',
    params: [numberToHex(gasLimit)],
  })
}
