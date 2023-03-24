import type { Address, TypedData } from 'abitype'
import type { Hash } from './misc'
import type { TransactionRequest } from './transaction'
import type { TypedDataDefinition } from './typedData'
import type { IsUndefined } from './utils'

export type Account<TAddress extends Address = Address> =
  | JsonRpcAccount<TAddress>
  | LocalAccount<TAddress>

export type GetAccountParameter<
  TAccount extends Account | undefined = Account | undefined,
> = IsUndefined<TAccount> extends true
  ? { account: Account | Address }
  : { account?: Account | Address }

export type JsonRpcAccount<TAddress extends Address = Address> = {
  address: TAddress
  type: 'json-rpc'
}

export type LocalAccount<TAddress extends Address = Address> = {
  address: TAddress
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
