import type { Address, TypedData } from 'abitype'
import type { TypedDataDefinition } from '../actions/wallet/index.js'
import type { Hash } from './misc.js'
import type { TransactionRequest } from './transaction.js'

export type Account = JsonRpcAccount | LocalAccount

export type JsonRpcAccount = {
  address: Address
  type: 'json-rpc'
}

export type LocalAccount = {
  address: Address
  signMessage: (message: string) => Promise<Hash>
  signTransaction: (
    transaction: Omit<TransactionRequest, 'from'> & {
      chainId: number
      from: Address
    },
  ) => Promise<Hash>
  signTypedData: <
    TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string,
  >(
    typedData: TypedDataDefinition<TTypedData, TPrimaryType>,
  ) => Promise<Hash>
  type: 'local'
}
