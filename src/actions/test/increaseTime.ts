import type { TestClientArg } from '../../clients'
import { numberToHex } from '../../utils'

export type IncreaseTimeParameters = {
  /** The amount of seconds to jump forward in time. */
  seconds: number
}

export async function increaseTime(
  client: TestClientArg,
  { seconds }: IncreaseTimeParameters,
) {
  return await client.request({
    method: 'evm_increaseTime',
    params: [numberToHex(seconds)],
  })
}
