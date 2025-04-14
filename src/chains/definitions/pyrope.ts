import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11155111 // Sepolia testnet

export const pyrope = defineChain({
  ...chainConfig,
  name: 'Pyrope Testnet',
  testnet: true,
  id: 695569,
  sourceId,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.pyropechain.com'],
      webSocket: ['wss://rpc.pyropechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://pyrope.blockscout.com',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l1StandardBridge: {
      [sourceId]: {
        address: '0xC24932c31D9621aE9e792576152B7ef010cFC2F8',
      },
    },
  },
})
