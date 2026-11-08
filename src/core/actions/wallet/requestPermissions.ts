import type { Errors, RpcSchema } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Requests permissions for a wallet.
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
 * const permissions = await Actions.wallet.requestPermissions(client, {
 *   eth_accounts: {},
 * })
 * ```
 */
export async function requestPermissions(
  client: Client.Client,
  options: requestPermissions.Options,
): Promise<requestPermissions.ReturnType> {
  return client.request(
    {
      method: 'wallet_requestPermissions',
      params: [options],
    },
    { retryCount: 0 },
  )
}

export declare namespace requestPermissions {
  type Options = RpcSchema.ExtractParams<
    RpcSchema.Default,
    'wallet_requestPermissions'
  >[0]

  type ReturnType = RpcSchema.ExtractReturnType<
    RpcSchema.Default,
    'wallet_requestPermissions'
  >

  type ErrorType = Errors.GlobalErrorType
}
