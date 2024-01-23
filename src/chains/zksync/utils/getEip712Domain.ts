import type { EIP712DomainFn } from '../types/eip712.js'
import type {
  ZkSyncEIP712TransactionSignable,
  ZkSyncTransactionSerializable,
  ZkSyncTransactionSerializableEIP712,
} from '../types/transaction.js'
import { assertEip712Transaction } from './assertEip712Transaction.js'

export const getEip712Domain: EIP712DomainFn<
  ZkSyncTransactionSerializable,
  ZkSyncEIP712TransactionSignable
> = (transaction) => {
  assertEip712Transaction(transaction)

  const message = transactionToMessage(
    transaction as ZkSyncTransactionSerializableEIP712,
  )

  return {
    domain: {
      name: 'zkSync',
      version: '2',
      chainId: transaction.chainId,
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
    message: message,
  }
}

//////////////////////////////////////////////////////////////////////////////
// Utilities

function transactionToMessage(
  transaction: ZkSyncTransactionSerializableEIP712,
): ZkSyncEIP712TransactionSignable {
  const {
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

  return {
    txType: 113n,
    from: BigInt(from),
    to: to ? BigInt(to) : 0n,
    gasLimit: gas ?? 0n,
    gasPerPubdataByteLimit: gasPerPubdata ?? 0n,
    maxFeePerGas: maxFeePerGas ?? 0n,
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? 0n,
    paymaster: paymaster ? BigInt(paymaster) : 0n,
    nonce: nonce ? BigInt(nonce) : 0n,
    value: value ?? 0n,
    data: data ? data : '0x0',
    factoryDeps: factoryDeps ?? [],
    paymasterInput: paymasterInput ? paymasterInput : '0x0',
  }
}
