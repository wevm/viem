import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { PublicZksyncRpcSchema } from '../types/eip1193.js'
import type { ZksyncTransactionDetails } from '../types/transaction.js'

export type GetTransactionDetailsParameters = {
  txHash: Hash
}

export type GetTransactionDetailsReturnType = ZksyncTransactionDetails

export async function getTransactionDetails<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZksyncRpcSchema>,
  parameters: GetTransactionDetailsParameters,
): Promise<GetTransactionDetailsReturnType> {
  const result = await client.request({
    method: 'zks_getTransactionDetails',
    params: [parameters.txHash],
  })
  return result
}
