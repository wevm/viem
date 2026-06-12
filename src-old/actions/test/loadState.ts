import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type LoadStateParameters = { state: Hex }
export type LoadStateReturnType = void
export type LoadStateErrorType = RequestErrorType | ErrorType

/**
 * Adds state previously dumped with `dumpState` to the current chain.
 *
 * - Docs: https://viem.sh/docs/actions/test/loadState
 *
 * @param client - Client to use
 * @param parameters - {@link LoadStateParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { loadState } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await loadState(client, { state: '0x...' })
 */
export async function loadState<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, chain, account, false>,
  { state }: LoadStateParameters,
): Promise<LoadStateReturnType> {
  await client.request({
    method: `${client.mode}_loadState`,
    params: [state],
  })
}
