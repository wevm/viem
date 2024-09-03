import { transactionToMessage } from '../..//zksync/utils/getEip712Domain.js'
import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'
import type { EIP712DomainFn } from '../../zksync/types/eip712.js'
import type {
  ZksyncEIP712TransactionSignable,
  ZksyncTransactionSerializable,
  ZksyncTransactionSerializableEIP712,
} from '../../zksync/types/transaction.js'
import { assertEip712Transaction } from '../../zksync/utils/assertEip712Transaction.js'

export const getAbstractEip712Domain: EIP712DomainFn<
  ZksyncTransactionSerializable,
  ZksyncEIP712TransactionSignable
> = (transaction) => {
  assertEip712Transaction(transaction)

  const message = transactionToMessage(
    transaction as ZksyncTransactionSerializableEIP712,
  )

  return {
    domain: {
      name: 'Abstract',
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

export const abstractTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 11_124,
  name: 'Abstract Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://api.testnet.abs.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Abstract Block Explorer',
      url: 'https://explorer.testnet.abs.xyz',
    },
  },
  testnet: true,
  custom: {
    getAbstractEip712Domain, // Use Abstract's specific EIP712 domain
  },
})
