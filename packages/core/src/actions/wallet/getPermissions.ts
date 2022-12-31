import type { WalletClient } from '../../clients'
import type { WalletPermission } from '../../types/eip1193'

export type GetPermissionsResponse = WalletPermission[]

export async function getPermissions(client: WalletClient) {
  const permissions = await client.request({ method: 'wallet_getPermissions' })
  return permissions
}
