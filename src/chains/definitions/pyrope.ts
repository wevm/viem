import { chainConfig } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11155111n // Sepolia testnet

export const pyrope = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  name: 'Pyrope Testnet',
  testnet: true,
  id: 695569n,
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
      [sourceId.toString()]: {
        address: '0xC24932c31D9621aE9e792576152B7ef010cFC2F8',
      },
    },
  },
})
