import type { WalletClient } from '../../clients/index.js'
import type { WalletPermission } from '../../types/eip1193.js'

export type GetPermissionsReturnType = WalletPermission[]

export async function getPermissions(client: WalletClient) {
  const permissions = await client.request({ method: 'wallet_getPermissions' })
  return permissions
}
