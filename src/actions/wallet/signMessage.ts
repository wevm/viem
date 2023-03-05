import type { WalletClient } from '../../clients'
import type { Account, Hex } from '../../types'
import { toHex } from '../../utils'

export type SignMessageParameters = {
  account: Account
  data: string
}

export type SignMessageReturnType = Hex

export async function signMessage(
  client: WalletClient,
  { account, data }: SignMessageParameters,
): Promise<SignMessageReturnType> {
  if (account.type === 'local') return account.signMessage(data)
  return client.request({
    method: 'personal_sign',
    params: [toHex(data), account.address],
  })
}
