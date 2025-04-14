import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'

export type ShowCallsStatusParameters = { id: string }

export type ShowCallsStatusReturnType = void

export type ShowCallsStatusErrorType = RequestErrorType | ErrorType

/**
 * Requests for the wallet to show information about a call batch
 * that was sent via `sendCalls`.
 *
 * - Docs: https://viem.sh/experimental/eip5792/showCallsStatus
 * - JSON-RPC Methods: [`wallet_showCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Status of the calls. {@link ShowCallsStatusReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { showCallsStatus } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * await showCallsStatus(client, { id: '0xdeadbeef' })
 */
export async function showCallsStatus<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: ShowCallsStatusParameters,
): Promise<ShowCallsStatusReturnType> {
  const { id } = parameters
  await client.request({
    method: 'wallet_showCallsStatus',
    params: [id],
  })
  return
}
