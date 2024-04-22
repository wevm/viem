import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { ZkSyncNumberParameter } from '../types/block.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'
import type { Fee } from './estimateFee.js'

export type GetRawBlockTransactionParameters = ZkSyncNumberParameter

export type CommonDataRawBlockTransaction = {
  sender: Address
  maxFeePerGas: Hex
  gasLimit: Hex
  gasPerPubdataLimit: Hex
  ethHash: Hash
  ethBlock: number
  canonicalTxHash: Hash
  toMint: Hex
  refundRecipient: Address
}

export type RawBlockTransactions = {
  common_data: {
    L1?: {
      serialId: number
      deadlineBlock: number
      layer2TipFee: Hex
      fullFee: Hex
      opProcessingType: string
      priorityQueueType: string
    } & CommonDataRawBlockTransaction
    L2?: {
      nonce: number
      fee: Fee
      initiatorAddress: Address
      signature: Uint8Array
      transactionType: string
      input?: {
        hash: Hash
        data: Uint8Array
      }
      paymasterParams: {
        paymaster: Address
        paymasterInput: Uint8Array
      }
    }
    ProtocolUpgrade?: {
      upgradeId: string
    } & CommonDataRawBlockTransaction
  }
  execute: {
    calldata: Hash
    contractAddress: Address
    factoryDeps?: Hash
    value: bigint
  }
  received_timestamp_ms: number
  raw_bytes?: string
}[]

export async function getRawBlockTransactions<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: GetRawBlockTransactionParameters,
): Promise<RawBlockTransactions> {
  const result = await client.request({
    method: 'zks_getRawBlockTransactions',
    params: [parameters.number],
  })
  return result
}
