import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type GetRawBlockTransactionParameters = {
  number: number
}

export type RawBlockTransactions = {
  common_data: {
    L2: {
      nonce: number
      fee: {
        gas_limit: bigint
        max_fee_per_gas: bigint
        max_priority_fee_per_gas: bigint
        gas_per_pubdata_limit: bigint
      }
      initiatorAddress: Address
      signature: Uint8Array
      transactionType: string
      input: {
        hash: string
        data: Uint8Array
      }
      paymasterParams: {
        paymaster: Address
        paymasterInput: Uint8Array
      }
    }
  }
  execute: {
    calldata: string
    contractAddress: Address
    factoryDeps: Hash
    value: bigint
  }
  received_timestamp_ms: number
  raw_bytes: string
}[]

export async function getRawBlockTransactions<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetRawBlockTransactionParameters,
): Promise<RawBlockTransactions> {
  const result = await client.request({
    method: 'zks_getRawBlockTransactions',
    params: [parameters.number],
  })
  return result
}
