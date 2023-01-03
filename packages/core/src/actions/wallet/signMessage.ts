import type { WalletClient } from '../../clients'
import type { Address, Hex } from '../../types'

export type SignMessageArgs = {
  from: Address
  data: Hex
}

export type SignMessageResponse = Hex

export async function signMessage(
  client: WalletClient,
  { from, data }: SignMessageArgs,
): Promise<SignMessageResponse> {
  const signed = await client.request({
    method: 'personal_sign',
    params: [data, from],
  })
  return signed
}
