import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'
import type { Hash } from '../../types/misc.js'
import type { ChainEIP712 } from '../types/chain.js'

export type GetRawBlockTransactionParameters = {
  number: number
}

export interface RawBlockTransaction {
  common_data: {
    L2: {
      nonce: number
      fee: {
        gas_limit: BigInt
        max_fee_per_gas: BigInt
        max_priority_fee_per_gas: BigInt
        gas_per_pubdata_limit: BigInt
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
    value: BigInt
  }
  received_timestamp_ms: number
  raw_bytes: string
}

export async function getRawBlockTransaction<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetRawBlockTransactionParameters,
): Promise<RawBlockTransaction> {
  const result = await client.request({
    method: 'zks_getRawBlockTransactions',
    params: [parameters.number],
  })
  return result
}
