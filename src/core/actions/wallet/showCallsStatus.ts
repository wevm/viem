import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'

/**
 * Requests for the wallet to show information about a call batch that was sent
 * via `sendCalls`.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * await Actions.wallet.showCallsStatus(client, { id: '0xdeadbeef' })
 * ```
 */
export async function showCallsStatus(
  client: Client.Client,
  options: showCallsStatus.Options,
): Promise<showCallsStatus.ReturnType> {
  const { id } = options
  await client.request({
    method: 'wallet_showCallsStatus',
    params: [id],
  })
  return
}

export declare namespace showCallsStatus {
  type Options = {
    /** Identifier of the call batch. */
    id: string
  }

  type ReturnType = void

  type ErrorType = Errors.GlobalErrorType
}
