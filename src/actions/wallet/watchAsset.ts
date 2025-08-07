import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type {
  EIP1193RequestOptions,
  WatchAssetParams,
} from '../../types/eip1193.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type WatchAssetParameters = WatchAssetParams & {
  /** Request options. */
  requestOptions?: EIP1193RequestOptions | undefined
}
export type WatchAssetReturnType = boolean
export type WatchAssetErrorType = RequestErrorType | ErrorType

/**
 * Adds an EVM chain to the wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/watchAsset
 * - JSON-RPC Methods: [`eth_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-747)
 *
 * @param client - Client to use
 * @param parameters - {@link WatchAssetParameters}
 * @returns Boolean indicating if the token was successfully added. {@link WatchAssetReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { watchAsset } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const success = await watchAsset(client, {
 *   type: 'ERC20',
 *   options: {
 *     address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
 *     decimals: 18,
 *     symbol: 'WETH',
 *   },
 * })
 */
export async function watchAsset<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  params: WatchAssetParameters,
): Promise<WatchAssetReturnType> {
  const { requestOptions, ...watchAssetParams } = params
  const added = await client.request(
    {
      method: 'wallet_watchAsset',
      params: watchAssetParams,
    },
    { retryCount: 0, ...requestOptions },
  )
  return added
}
