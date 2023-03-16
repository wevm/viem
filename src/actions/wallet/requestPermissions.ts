import type { WalletClient } from '../../clients'
import type { WalletPermission } from '../../types/eip1193'

export type RequestPermissionsParameters = {
  eth_accounts: Record<string, any>
} & {
  [key: string]: Record<string, any>
}
export type RequestPermissionsReturnType = WalletPermission[]

export async function requestPermissions(
  client: WalletClient<any, any>,
  permissions: RequestPermissionsParameters,
) {
  return client.request({
    method: 'wallet_requestPermissions',
    params: [permissions],
  })
}
