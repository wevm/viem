import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type SnapshotErrorType = RequestErrorType | ErrorType

/**
 * Snapshot the state of the blockchain at the current block.
 *
 * - Docs: https://viem.sh/docs/actions/test/snapshot
 *
 * @param client - Client to use
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { snapshot } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await snapshot(client)
 */
export async function snapshot<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(client: TestClient<TestClientMode, Transport, TChain, TAccount, false>) {
  return await client.request({
    method: 'evm_snapshot',
  })
}
