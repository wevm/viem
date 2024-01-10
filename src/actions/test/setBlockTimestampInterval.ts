import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type SetBlockTimestampIntervalParameters = {
  /** The interval (in seconds). */
  interval: number
}

export type SetBlockTimestampIntervalErrorType = RequestErrorType | ErrorType

/**
 * Similar to [`increaseTime`](https://viem.sh/docs/actions/test/increaseTime), but sets a block timestamp `interval`. The timestamp of future blocks will be computed as `lastBlock_timestamp` + `interval`.
 *
 * - Docs: https://viem.sh/docs/actions/test/setBlockTimestampInterval
 *
 * @param client - Client to use
 * @param parameters – {@link SetBlockTimestampIntervalParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setBlockTimestampInterval } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setBlockTimestampInterval(client, { interval: 5 })
 */
export async function setBlockTimestampInterval<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain, TAccount, false>,
  { interval }: SetBlockTimestampIntervalParameters,
) {
  const interval_ = (() => {
    if (client.mode === 'hardhat') return interval * 1000
    return interval
  })()

  await client.request({
    method: `${client.mode}_setBlockTimestampInterval`,
    params: [interval_],
  })
}
