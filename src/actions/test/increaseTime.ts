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

/**
 * Jump forward in time by the given amount of time, in seconds.
 *
 * - Docs: https://viem.sh/docs/actions/test/increaseTime.html
 *
 * @param client - Client to use
 * @param parameters – {@link IncreaseTimeParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { increaseTime } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await increaseTime(client, {
 *   seconds: 420,
 * })
 */
export async function increaseTime<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { seconds }: IncreaseTimeParameters,
) {
  return await client.request({
    method: 'evm_increaseTime',
    params: [numberToHex(seconds)],
  })
}
