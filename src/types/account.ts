import type { Address, TypedData } from 'abitype'
import { SignTypedDataParameters } from '../actions/wallet'
import type { Hash } from './misc'
import type { TransactionRequest } from './transaction'

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
  signTypedData: <TTypedData extends TypedData | { [key: string]: unknown }>(
    typedData: Omit<SignTypedDataParameters<TTypedData>, 'account'>,
  ) => Promise<Hash>
  type: 'local'
}
