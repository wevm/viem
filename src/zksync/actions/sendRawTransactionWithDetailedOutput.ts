import type { Address } from 'abitype'
import type { Hash, Hex } from '../../types/misc.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'

export type SendRawTransactionWithDetailedOutputParameters = {
  signedTx: Hex
}

export type SendRawTransactionWithDetailedReturnType =
  TransactionWithDetailedOutput

export type TransactionWithDetailedOutput = {
  transactionHash: Hash
  storageLogs: Array<{
    address: Address
    key: string
    writtenValue: string
  }>
  events: Array<{
    address: Address
    topics: Hex[]
    data: Hex
    blockHash: Hash | null
    blockNumber: bigint | null
    l1BatchNumber: bigint | null
    transactionHash: Hash
    transactionIndex: bigint
    logIndex: bigint | null
    transactionLogIndex: bigint | null
    logType: string | null
    removed: boolean
  }>
}

export async function sendRawTransactionWithDetailedOutput<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: SendRawTransactionWithDetailedOutputParameters,
): Promise<SendRawTransactionWithDetailedReturnType> {
  const tokens = await client.request({
    method: 'zks_sendRawTransactionWithDetailedOutput',
    params: [parameters.signedTx],
  })
  return tokens
}
