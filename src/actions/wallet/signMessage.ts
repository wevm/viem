import type { WalletClient } from '../../clients'
import type { Account, Hex } from '../../types'
import { toHex } from '../../utils'

export type SignMessageArgs = {
  account: Account
  data: string
}

export type SignMessageResponse = Hex

export async function signMessage(
  client: WalletClient,
  { account, data }: SignMessageArgs,
): Promise<SignMessageResponse> {
  if (account.type === 'local') return account.signMessage(data)
  return client.request({
    method: 'personal_sign',
    params: [toHex(data), account.address],
  })
}
