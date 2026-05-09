import { defineChain } from '../../utils/chain/defineChain.js'

export const luksoTestnet = /*#__PURE__*/ defineChain({
  id: 4201,
  name: 'LUKSO Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'LUKSO Testnet',
    symbol: 'LYXt',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.lukso.network'],
      webSocket: ['wss://ws-rpc.testnet.lukso.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LUKSO Testnet Explorer',
      url: 'https://explorer.execution.testnet.lukso.network',
      apiUrl: 'https://api.explorer.execution.testnet.lukso.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 605348,
    },
  },
  testnet: true,
})
