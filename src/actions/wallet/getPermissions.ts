import type { WalletClientArg } from '../../clients'
import type { WalletPermission } from '../../types/eip1193'

export type GetPermissionsReturnType = WalletPermission[]

export async function getPermissions(client: WalletClientArg) {
  const permissions = await client.request({ method: 'wallet_getPermissions' })
  return permissions
}
