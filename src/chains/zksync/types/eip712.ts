import type { Address, TypedDataDomain } from 'abitype'
import type { Hex } from '../../../types/misc.js'
import type { ZkSyncTransactionSerializable } from './transaction.js'

type PaymasterParams = {
  paymaster: Address
  paymasterInput: number[]
}

export type ZkSyncEip712Meta = {
  gasPerPubdata?: Hex
  factoryDeps?: Hex[]
  customSignature?: Hex
  paymasterParams?: PaymasterParams
}

type EIP712FieldType = 'uint256' | 'bytes' | 'bytes32[]'
type EIP712Field = { name: string; type: EIP712FieldType }

export type EIP712Domain<TransactionSignable> = {
  domain: TypedDataDomain
  types: Record<string, EIP712Field[]>
  primaryType: string
  message: TransactionSignable
}

export type EIP712DomainFn<
  TTransactionSerializable extends
    ZkSyncTransactionSerializable = ZkSyncTransactionSerializable,
  TransactionSignable = {},
> = (transaction: TTransactionSerializable) => EIP712Domain<TransactionSignable>
