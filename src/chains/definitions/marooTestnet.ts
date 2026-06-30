import * as Chain from '../../core/Chain.js'

export const marooTestnet = /*#__PURE__*/ Chain.from({
  id: 450_815,
  name: 'Maroo Testnet',
  nativeCurrency: { name: 'Testnet OKRW', symbol: 'tOKRW', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.maroo.io'],
      webSocket: ['wss://ws-testnet.maroo.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer-testnet.maroo.io',
      apiUrl: 'https://explorer-testnet.maroo.io/blockscout/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
