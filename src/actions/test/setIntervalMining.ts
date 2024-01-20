import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type SetIntervalMiningParameters = {
  /** The mining interval. */
  interval: number
}

export type SetIntervalMiningErrorType = RequestErrorType | ErrorType

/**
 * Sets the automatic mining interval (in seconds) of blocks. Setting the interval to 0 will disable automatic mining.
 *
 * - Docs: https://viem.sh/docs/actions/test/setIntervalMining
 *
 * @param client - Client to use
 * @param parameters – {@link SetIntervalMiningParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setIntervalMining } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setIntervalMining(client, { interval: 5 })
 */
export async function setIntervalMining<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain, TAccount, false>,
  { interval }: SetIntervalMiningParameters,
) {
  const interval_ = (() => {
    if (client.mode === 'hardhat') return interval * 1000
    return interval
  })()

  await client.request({
    method: 'evm_setIntervalMining',
    params: [interval_],
  })
}
