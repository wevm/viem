import type { TestClientArg } from '../../clients'
import { numberToHex } from '../../utils'

export type SetBlockGasLimitParameters = {
  /** Gas limit (in wei). */
  gasLimit: bigint
}

export async function setBlockGasLimit(
  client: TestClientArg,
  { gasLimit }: SetBlockGasLimitParameters,
) {
  return await client.request({
    method: 'evm_setBlockGasLimit',
    params: [numberToHex(gasLimit)],
  })
}
