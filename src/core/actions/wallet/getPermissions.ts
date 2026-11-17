import type { Errors, RpcSchema } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Gets the wallet's current permissions.
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
 * const permissions = await Actions.wallet.getPermissions(client)
 * ```
 */
export async function getPermissions(
  client: Client.Client,
): Promise<getPermissions.ReturnType> {
  return client.request({ method: 'wallet_getPermissions' }, { dedupe: true })
}

export declare namespace getPermissions {
  type ReturnType = RpcSchema.ExtractReturnType<
    RpcSchema.Default,
    'wallet_getPermissions'
  >

  type ErrorType = Errors.GlobalErrorType
}
