import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'
import { numberToHex } from '../../utils'

export type SetBlockGasLimitParameters = {
  /** Gas limit (in wei). */
  gasLimit: bigint
}

export async function setBlockGasLimit<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  { gasLimit }: SetBlockGasLimitParameters,
) {
  return await client.request({
    method: 'evm_setBlockGasLimit',
    params: [numberToHex(gasLimit)],
  })
}
