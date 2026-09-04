import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Quantity } from '../../types/rpc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type RevertParameters = {
  /** The snapshot ID to revert to. */
  id: Quantity
}

export type SnapshotRevertErrorType = SnapshotRevertError & {
  name: 'SnapshotRevertError'
}
export class SnapshotRevertError extends BaseError {
  constructor({ id }: { id: Quantity }) {
    super(`Failed to revert to snapshot "${id}".`, {
      name: 'SnapshotRevertError',
      docsPath: '/docs/actions/test/revert',
    })
  }
}

export type RevertErrorType =
  | SnapshotRevertErrorType
  | RequestErrorType
  | ErrorType

/**
 * Revert the state of the blockchain at the current block.
 *
 * - Docs: https://viem.sh/docs/actions/test/revert
 *
 * @param client - Client to use
 * @param parameters – {@link RevertParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { revert } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await revert(client, { id: '0x…' })
 */
export async function revert<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, chain, account, false>,
  { id }: RevertParameters,
) {
  const reverted = await client.request({
    method: 'evm_revert',
    params: [id],
  })
  if (reverted === false) throw new SnapshotRevertError({ id })
}
