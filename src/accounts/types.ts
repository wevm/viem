import type { HDKey } from '@scure/bip32'
import type { Address, TypedData } from 'abitype'
import type {
  Hash,
  Hex,
  TransactionRequest,
  TypedDataDefinition,
} from '../types'

export type Account = JsonRpcAccount | LocalAccount

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

export type JsonRpcAccount = {
  address: Address
  type: 'json-rpc'
}

export type LocalAccount<TSource = 'custom'> = CustomSource & {
  address: Address
  publicKey: Hex
  getPrivateKey(): Hex
  source: TSource
  type: 'local'
}

export type HDAccount = LocalAccount<'hd'> & {
  getHdKey(): HDKey
}

export type HDOptions =
  | {
      accountIndex?: number
      addressIndex?: number
      changeIndex?: number
      path?: never
    }
  | {
      accountIndex?: never
      addressIndex?: never
      changeIndex?: never
      path: `m/44'/60'/${string}`
    }

export type PrivateKeyAccount = LocalAccount<'privateKey'>
