import * as Chain from '../../core/Chain.js'

export const luksoTestnet = /*#__PURE__*/ Chain.from({
  id: 4201,
  name: 'LUKSO Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'LUKSO Testnet',
    symbol: 'LYXt',
  },
  rpcUrls: {
    http: 'https://rpc.testnet.lukso.network',
    ws: 'wss://ws-rpc.testnet.lukso.network',
  },
  blockExplorers: {
    name: 'LUKSO Testnet Explorer',
    url: 'https://explorer.execution.testnet.lukso.network',
    apiUrl: 'https://api.explorer.execution.testnet.lukso.network/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 605348,
    },
  },
  testnet: true,
})
