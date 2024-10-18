import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'
import type { TransactionWithDetailedOutput } from '../../types/transaction.js'

export type SendRawTransactionWithDetailedOutputParameters = {
  serializedTransaction: Hex
}

export type SendRawTransactionWithDetailedReturnType =
  TransactionWithDetailedOutput

export async function sendRawTransactionWithDetailedOutput<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: SendRawTransactionWithDetailedOutputParameters,
): Promise<SendRawTransactionWithDetailedReturnType> {
  const tokens = await client.request({
    method: 'zks_sendRawTransactionWithDetailedOutput',
    params: [parameters.serializedTransaction],
  })
  return tokens
}
