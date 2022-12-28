import type { WalletClient } from '../../clients'
import type { Address, Data } from '../../types'

export type SignMessageArgs = {
  from: Address
  data: Data
}

export type SignMessageResponse = Data

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
