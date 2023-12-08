/**
 * There is some EIP712 types already defined in Viem code. Not sure how much
 * we can use them, but here is some types I've setup.
 */
import type { TypedDataDomain } from 'abitype'
import type { TransactionSerializable } from '../../../types/transaction.js'

// There is already a function getTypesForEIP712Domain, but not sure how to set up in here.
type EIP712FieldType = 'uint256' | 'bytes' | 'bytes32[]'
type EIP712Field = { name: string; type: EIP712FieldType }

// Maybe it is the same as SignTypedDataParameters?
export type EIP712Domain<TransactionToSign> = {
  domain: TypedDataDomain
  types: Record<string, EIP712Field[]>
  primaryType: string
  message: TransactionToSign
}

// Used to define the EIP712signer field in the chain.
export type EIP712DomainFn<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
  TransactionToSign = {},
> = (transaction: TTransactionSerializable) => EIP712Domain<TransactionToSign>
