import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'

export type Token = {
  l1Address: Address
  l2Address: Address
  name: string
  symbol: string
  decimals: number
}

export type GetConfirmedTokensReturnType = Token[]

export async function getConfirmedTokens<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
): Promise<GetConfirmedTokensReturnType> {
  const start = 0
  const limit = 255

  const tokens: Token[] = await client.request({
    method: 'zks_getConfirmedTokens',
    params: [start, limit],
  })
  return tokens
}
