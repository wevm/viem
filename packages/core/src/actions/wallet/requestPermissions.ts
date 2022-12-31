import type { WalletClient } from '../../clients'
import type { WalletPermission } from '../../types/eip1193'

export type RequestPermissionsArgs = {
  eth_accounts: Record<string, any>
} & {
  [key: string]: Record<string, any>
}
export type RequestPermissionsResponse = WalletPermission[]

export async function requestPermissions(
  client: WalletClient,
  permissions: RequestPermissionsArgs,
) {
  return client.request({
    method: 'wallet_requestPermissions',
    params: [permissions],
  })
}
