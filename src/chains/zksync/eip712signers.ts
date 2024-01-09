import { isEIP712 as isZkSyncEIP712 } from './serializers.js'
import type {
  ChainEIP712Domain,
  EIP712Domain,
  EIP712DomainFn,
  ZkSyncEIP712TransactionToSign,
  ZkSyncTransactionSerializable,
  ZkSyncTransactionSerializableEIP712,
} from './types.js'

export const getZkSyncEIP712Domain: EIP712DomainFn<
  ZkSyncTransactionSerializable,
  ZkSyncEIP712TransactionToSign
> = (tx) => {
  if (isZkSyncEIP712(tx))
    return createEIP712Domain(tx as ZkSyncTransactionSerializableEIP712)
  throw new Error('Cannot sign ZkSync EIP712 transaction, missing fields!')
}

export const eip712domainZkSync: ChainEIP712Domain = {
  eip712domain: getZkSyncEIP712Domain,
  isEip712domain: isZkSyncEIP712,
}

//////////////////////////////////////////////////////////////////////////////
// EIP712 Signers

function createEIP712Domain(
  transaction: ZkSyncTransactionSerializableEIP712,
): EIP712Domain<ZkSyncEIP712TransactionToSign> {
  const message = transactionToMessage(transaction)

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
): ZkSyncEIP712TransactionToSign {
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
    data: data ? data : '0x01',
    factoryDeps: factoryDeps ?? [],
    paymasterInput: paymasterInput ? paymasterInput : '0x0',
  }
}
