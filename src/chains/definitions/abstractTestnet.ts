import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'
import type { ZksyncTransactionSerializableEIP712 } from '../../zksync/types/transaction.js'
import { transactionToMessage } from '../../zksync/utils/getEip712Domain.js'

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
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
      blockCreated: 358349,
    },
  },
  custom: {
    getEip712Domain(transaction: ZksyncTransactionSerializableEIP712) {
      const message = transactionToMessage(transaction)

      return {
        domain: {
          name: 'Abstract', // Use 'Abstract' rather than 'zkSync'
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
    },
  },
})
