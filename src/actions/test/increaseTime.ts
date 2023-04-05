import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'
import { numberToHex } from '../../utils'

export type IncreaseTimeParameters = {
  /** The amount of seconds to jump forward in time. */
  seconds: number
}

export async function increaseTime<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  { seconds }: IncreaseTimeParameters,
) {
  return await client.request({
    method: 'evm_increaseTime',
    params: [numberToHex(seconds)],
  })
}
