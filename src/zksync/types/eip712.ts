import type { Address, TypedDataDomain } from 'abitype'
import type { Hex } from '../../types/misc.js'
import type { ZkSyncTransactionSerializable } from './transaction.js'

type PaymasterParams = {
  paymaster: Address
  paymasterInput: number[]
}

export type ZkSyncEip712Meta = {
  gasPerPubdata?: Hex | undefined
  factoryDeps?: Hex[] | undefined
  customSignature?: Hex | undefined
  paymasterParams?: PaymasterParams | undefined
}

type EIP712FieldType = 'uint256' | 'bytes' | 'bytes32[]'
type EIP712Field = { name: string; type: EIP712FieldType }

export type EIP712Domain<transactionSignable> = {
  domain: TypedDataDomain
  types: Record<string, EIP712Field[]>
  primaryType: string
  message: transactionSignable
}

export type EIP712DomainFn<
  transactionSerializable extends
    ZkSyncTransactionSerializable = ZkSyncTransactionSerializable,
  transactionSignable = {},
> = (transaction: transactionSerializable) => EIP712Domain<transactionSignable>
