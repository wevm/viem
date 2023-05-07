import type { Account } from '../../accounts/types.js'
import type { WalletClient } from '../../clients/createWalletClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { WalletPermission } from '../../types/eip1193.js'

export type GetPermissionsReturnType = WalletPermission[]

/**
 * Gets the wallets current permissions.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getPermissions.html
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
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(client: WalletClient<Transport, TChain, TAccount>) {
  const permissions = await client.request({ method: 'wallet_getPermissions' })
  return permissions
}
