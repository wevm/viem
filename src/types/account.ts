import type { Address } from 'abitype'
import type { Hash } from './misc'
import type { TransactionRequest } from './transaction'

export type Account = JsonRpcAccount | ExternallyOwnedAccount

export type JsonRpcAccount = {
  address: Address
  type: 'json-rpc'
}

export type ExternallyOwnedAccount = {
  address: Address
  signMessage: (message: string) => Promise<Hash>
  signTransaction: (
    transaction: Omit<TransactionRequest, 'from'> & {
      chainId: number
      from: Address
    },
  ) => Promise<Hash>
  type: 'externally-owned'
}
