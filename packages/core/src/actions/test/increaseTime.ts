import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type IncreaseTimeArgs = {
  /** The amount of seconds to jump forward in time. */
  seconds: number
}

export async function increaseTime(
  client: TestClient,
  { seconds }: IncreaseTimeArgs,
) {
  return await client.request({
    method: 'evm_increaseTime',
    params: [numberToHex(seconds)],
  })
}
