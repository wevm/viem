import type { Errors } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Requests to disconnect connected account(s) via
 * [ERC-7846 `wallet_disconnect`](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7846.md).
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
 * await Actions.wallet.disconnect(client)
 * ```
 */
export async function disconnect(client: Client.Client): Promise<void> {
  await client.request(
    { method: 'wallet_disconnect' },
    { dedupe: true, retryCount: 0 },
  )
}

export declare namespace disconnect {
  type ErrorType = Errors.GlobalErrorType
}
