import type { Chain } from '@wagmi/chains'
import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import { numberToHex } from '../../utils/index.js'

export type IncreaseTimeParameters = {
  /** The amount of seconds to jump forward in time. */
  seconds: number
}

export async function increaseTime<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { seconds }: IncreaseTimeParameters,
) {
  return await client.request({
    method: 'evm_increaseTime',
    params: [numberToHex(seconds)],
  })
}
