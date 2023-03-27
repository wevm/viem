import type { WalletClient } from '../../clients/index.js'
import type { Account, Hex } from '../../types/index.js'
import { toHex } from '../../utils/index.js'

export type SignMessageParameters = {
  account: Account
} & (
  | {
      /** @deprecated – `data` will be removed in 0.2.0; use `message` instead. */
      data: string
      message?: never
    }
  | {
      data?: never
      message: string
    }
)

export type SignMessageReturnType = Hex

export async function signMessage(
  client: WalletClient,
  { account, data, message }: SignMessageParameters,
): Promise<SignMessageReturnType> {
  const message_ = message || data
  if (account.type === 'local') return account.signMessage(message_!)
  return client.request({
    method: 'personal_sign',
    params: [toHex(message_!), account.address],
  })
}
