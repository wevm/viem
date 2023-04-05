import type { Transport, WalletClient } from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'
import type { WalletPermission } from '../../types/eip1193.js'

export type RequestPermissionsParameters = {
  eth_accounts: Record<string, any>
} & {
  [key: string]: Record<string, any>
}
export type RequestPermissionsReturnType = WalletPermission[]

export async function requestPermissions<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<Transport, TChain, TAccount>,
  permissions: RequestPermissionsParameters,
) {
  return client.request({
    method: 'wallet_requestPermissions',
    params: [permissions],
  })
}
