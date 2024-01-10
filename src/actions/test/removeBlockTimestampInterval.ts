import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type RemoveBlockTimestampIntervalErrorType = RequestErrorType | ErrorType

/**
 * Removes [`setBlockTimestampInterval`](https://viem.sh/docs/actions/test/setBlockTimestampInterval) if it exists.
 *
 * - Docs: https://viem.sh/docs/actions/test/removeBlockTimestampInterval
 *
 * @param client - Client to use
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { removeBlockTimestampInterval } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await removeBlockTimestampInterval(client)
 */
export async function removeBlockTimestampInterval<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(client: TestClient<TestClientMode, Transport, TChain, TAccount, false>) {
  await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
