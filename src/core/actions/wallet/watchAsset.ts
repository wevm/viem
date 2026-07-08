import type { Errors, RpcSchema } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Adds an EVM token to the wallet's watchlist so its balance is tracked.
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
 * const success = await Actions.wallet.watchAsset(client, {
 *   type: 'ERC20',
 *   options: {
 *     address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
 *     decimals: 18,
 *     symbol: 'WETH',
 *   },
 * })
 * ```
 */
export async function watchAsset(
  client: Client.Client,
  options: watchAsset.Options,
): Promise<watchAsset.ReturnType> {
  return client.request(
    {
      method: 'wallet_watchAsset',
      params: [options],
    },
    { retryCount: 0 },
  )
}

export declare namespace watchAsset {
  type Options = RpcSchema.ExtractParams<
    RpcSchema.Default,
    'wallet_watchAsset'
  >[0]

  type ReturnType = RpcSchema.ExtractReturnType<
    RpcSchema.Default,
    'wallet_watchAsset'
  >

  type ErrorType = Errors.GlobalErrorType
}
