import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type {
  EIP1193RequestOptions,
  WalletPermission,
} from '../../types/eip1193.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type GetPermissionsParameters = {
  /** Request options. */
  requestOptions?: EIP1193RequestOptions | undefined
}

export type GetPermissionsReturnType = WalletPermission[]

export type GetPermissionsErrorType = RequestErrorType | ErrorType

/**
 * Gets the wallets current permissions.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getPermissions
 * - JSON-RPC Methods: [`wallet_getPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
 *
 * @param client - Client to use
 * @returns The wallet permissions. {@link GetPermissionsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getPermissions } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const permissions = await getPermissions(client)
 */
export async function getPermissions<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetPermissionsParameters = {},
) {
  const { requestOptions } = parameters
  const permissions = await client.request(
    { method: 'wallet_getPermissions' },
    { dedupe: true, ...requestOptions },
  )
  return permissions
}
