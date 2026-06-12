import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'

export type GetTxpoolStatusReturnType = {
  pending: number
  queued: number
}

export type GetTxpoolStatusErrorType = RequestErrorType | ErrorType

/**
 * Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
 *
 * - Docs: https://viem.sh/docs/actions/test/getTxpoolStatus
 *
 * @param client - Client to use
 * @returns Transaction pool status. {@link GetTxpoolStatusReturnType}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { getTxpoolStatus } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * const status = await getTxpoolStatus(client)
 */
export async function getTxpoolStatus<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, chain, account, false>,
): Promise<GetTxpoolStatusReturnType> {
  const { pending, queued } = await client.request({
    method: 'txpool_status',
  })
  return {
    pending: hexToNumber(pending),
    queued: hexToNumber(queued),
  }
}
