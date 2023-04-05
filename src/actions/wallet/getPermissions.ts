import type { Client, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import type { WalletPermission } from '../../types/eip1193'

export type GetPermissionsReturnType = WalletPermission[]

export async function getPermissions<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(client: WalletClient<TChain, TAccount> | Client<TChain>) {
  const permissions = await client.request({ method: 'wallet_getPermissions' })
  return permissions
}
