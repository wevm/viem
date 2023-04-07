import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetBlockGasLimitParameters = {
  /** Gas limit (in wei). */
  gasLimit: bigint
}

export async function setBlockGasLimit<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { gasLimit }: SetBlockGasLimitParameters,
) {
  return await client.request({
    method: 'evm_setBlockGasLimit',
    params: [numberToHex(gasLimit)],
  })
}
