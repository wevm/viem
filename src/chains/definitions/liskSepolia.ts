import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../opStack/chainConfig.js'

const sourceId = 11_155_111 // sepolia

export const liskSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4202,
  network: 'lisk-sepolia',
  name: 'Lisk Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-blockscout.lisk.com',
      apiUrl: 'https://sepolia-blockscout.lisk.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
  },
  testnet: true,
  sourceId,
})
