import type { WalletClient } from '../../clients/index.js'
import type { WalletPermission } from '../../types/eip1193.js'

export type RequestPermissionsParameters = {
  eth_accounts: Record<string, any>
} & {
  [key: string]: Record<string, any>
}
export type RequestPermissionsReturnType = WalletPermission[]

export async function requestPermissions(
  client: WalletClient,
  permissions: RequestPermissionsParameters,
) {
  return client.request({
    method: 'wallet_requestPermissions',
    params: [permissions],
  })
}
