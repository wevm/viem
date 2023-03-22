import type { Transport, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import type { WalletPermission } from '../../types/eip1193'

export type RequestPermissionsParameters = {
  eth_accounts: Record<string, any>
} & {
  [key: string]: Record<string, any>
}
export type RequestPermissionsReturnType = WalletPermission[]

export async function requestPermissions<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<TTransport, TChain, TAccount>,
  permissions: RequestPermissionsParameters,
) {
  return client.request({
    method: 'wallet_requestPermissions',
    params: [permissions],
  })
}
