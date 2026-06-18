import * as Chain from '../../core/Chain.js'

export const lukso = /*#__PURE__*/ Chain.from({
  id: 42,
  name: 'LUKSO',
  nativeCurrency: {
    name: 'LUKSO',
    symbol: 'LYX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.lukso.network'],
      webSocket: ['wss://ws-rpc.mainnet.lukso.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LUKSO Mainnet Explorer',
      url: 'https://explorer.execution.mainnet.lukso.network',
      apiUrl: 'https://api.explorer.execution.mainnet.lukso.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 468183,
    },
  },
})
