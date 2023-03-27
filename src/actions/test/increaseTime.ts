import type { TestClient } from '../../clients/index.js'
import { numberToHex } from '../../utils/index.js'

export type IncreaseTimeParameters = {
  /** The amount of seconds to jump forward in time. */
  seconds: number
}

export async function increaseTime(
  client: TestClient,
  { seconds }: IncreaseTimeParameters,
) {
  return await client.request({
    method: 'evm_increaseTime',
    params: [numberToHex(seconds)],
  })
}
