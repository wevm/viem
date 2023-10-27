import type { ChainSerializers } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionSerializable } from '../../types/transaction.js'
import { isEIP712 as isZkSyncEIP712 } from './serializers.js'
import type {
  ZkSyncTransactionSerializable,
  ZkSyncTransactionSerializableEIP712,
  ZkSyncTransactionSerializedEIP712,
} from './types.js'

import type { TypedDataDomain } from 'abitype'

// Generic Type, to move to an outside file
type SignTransactionFn<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
> = typeof signTransaction<TTransactionSerializable>

export function signTransaction<
  TTransactionSerializable extends TransactionSerializable,
>(transaction: TTransactionSerializable): Hex {
  return signTransactionZkSync(transaction)
}

// ZkSync specific

export const signTransactionZkSync: SignTransactionFn<
  ZkSyncTransactionSerializable
> = (tx) => {
  if (isZkSyncEIP712(tx))
    return signTransactionEIP712ZkSync(
      tx as ZkSyncTransactionSerializableEIP712,
    )
  throw new Error('Cannot sign ZkSync EIP712 transaction, missing fields!')
}

export const signZkSync = {
  transaction: signTransactionZkSync,
} as const satisfies ChainSerializers

//////////////////////////////////////////////////////////////////////////////
// EIP712 Signers

export type SerializeTransactionEIP712ReturnType =
  ZkSyncTransactionSerializedEIP712

// There is already a function getTypesForEIP712Domain, but not sure how to set up in here.
type EIP712FieldType = 'uint256' | 'bytes' | 'bytes32[]'
type EIP712Field = { name: string; type: EIP712FieldType }

// Maybe it is the same as SignTypedDataParameters?
type EIP712Domain<TransactionToSign> = {
  domain: TypedDataDomain
  types: Record<string, EIP712Field[]>
  primaryType: string
  message: TransactionToSign
}

type ZkSyncEIP712TransactionToSign = {
  txType: bigint
  from: bigint
  to: bigint
  gasLimit: bigint
  gasPerPubdataByteLimit: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  paymaster: bigint
  nonce: bigint
  value: bigint
  data: Hex
  factoryDeps: Hex[]
  paymasterInput: Hex
}

function signTransactionEIP712ZkSync(
  transaction: ZkSyncTransactionSerializableEIP712,
): EIP712Domain<ZkSyncEIP712TransactionToSign> {
  const {
    chainId,
    gas,
    nonce,
    to,
    from,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    factoryDeps,
    paymaster,
    paymasterInput,
    gasPerPubdata,
    data,
  } = transaction

  // Convert from ZkSyncTransactionSerializableEIP712 to ZkSyncEIP712TransactionToSign
  const transactionToSign = {
    txType: 113n,
    from: BigInt(from),
    to: to ? BigInt(to) : 0n,
    gasLimit: gas ?? 0n,
    gasPerPubdataByteLimit: gasPerPubdata ?? 0n,
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? 0n,
    paymaster: paymaster ? BigInt(paymaster) : 0n,
    nonce: nonce ? BigInt(nonce) : 0n,
    value: value ?? 0n,
    data: data ? data : '0x0',
    factoryDeps: factoryDeps ?? [],
    paymasterInput: paymasterInput ? paymasterInput : '0x0',
  }

  // Return structure to sign, ready to be send to MetaMask
  return {
    domain: {
      name: 'zkSync',
      version: '2',
      chainId: chainId,
    },
    types: {
      Transaction: [
        { name: 'txType', type: 'uint256' },
        { name: 'from', type: 'uint256' },
        { name: 'to', type: 'uint256' },
        { name: 'gasLimit', type: 'uint256' },
        { name: 'gasPerPubdataByteLimit', type: 'uint256' },
        { name: 'maxFeePerGas', type: 'uint256' },
        { name: 'maxPriorityFeePerGas', type: 'uint256' },
        { name: 'paymaster', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' },
        { name: 'factoryDeps', type: 'bytes32[]' },
        { name: 'paymasterInput', type: 'bytes' },
      ],
    },
    primaryType: 'Transaction',
    message: transactionToSign,
  }
}

//////////////////////////////////////////////////////////////////////////////
// Utilities
