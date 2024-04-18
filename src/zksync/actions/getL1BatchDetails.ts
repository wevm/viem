import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'
import type { BaseBlockDetails } from './getBlockDetails.js'

export type GetL1BatchDetailsParameters = {
  number: number
}

export type BatchDetails = BaseBlockDetails & {
  l1GasPrice: number
  l2FairGasPrice: number
}

export async function getL1BatchDetails<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetL1BatchDetailsParameters,
): Promise<BatchDetails> {
  const result = await client.request({
    method: 'zks_getL1BatchDetails',
    params: [parameters.number],
  })
  return result
}
