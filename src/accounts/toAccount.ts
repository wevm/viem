import type { TypedData } from 'abitype'
import { InvalidAddressError } from '../errors'
import type {
  Address,
  Hash,
  TransactionRequest,
  TypedDataDefinition,
} from '../types'
import { isAddress } from '../utils'

export type AccountSource = Address | CustomSource
export type CustomSource = {
  address: Address
  signMessage: ({ message }: { message: string }) => Promise<Hash>
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
}

export type Account = JsonRpcAccount | LocalAccount
export type JsonRpcAccount = {
  address: Address
  type: 'json-rpc'
}
export type LocalAccount<TSource = 'custom'> = CustomSource & {
  address: Address
  source: TSource
  type: 'local'
}

type GetAccountReturnType<TAccountSource extends AccountSource> =
  | (TAccountSource extends Address ? JsonRpcAccount : never)
  | (TAccountSource extends CustomSource ? LocalAccount : never)

export function toAccount<TAccountSource extends AccountSource>(
  source: TAccountSource,
): GetAccountReturnType<TAccountSource> {
  if (typeof source === 'string') {
    if (!isAddress(source)) throw new InvalidAddressError({ address: source })
    return {
      address: source,
      type: 'json-rpc',
    } as GetAccountReturnType<TAccountSource>
  }

  if (!isAddress(source.address))
    throw new InvalidAddressError({ address: source.address })
  return {
    address: source.address,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: 'custom',
    type: 'local',
  } as GetAccountReturnType<TAccountSource>
}
