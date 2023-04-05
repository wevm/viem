import type { Client, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import type { WalletPermission } from '../../types/eip1193'

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
  client: WalletClient<TChain, TAccount> | Client<TChain>,
  permissions: RequestPermissionsParameters,
) {
  return client.request({
    method: 'wallet_requestPermissions',
    params: [permissions],
  })
}
