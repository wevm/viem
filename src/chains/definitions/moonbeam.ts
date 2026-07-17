import * as Chain from '../../core/Chain.js'

export const moonbeam = /*#__PURE__*/ Chain.from({
  id: 1284,
  name: 'Moonbeam',
  nativeCurrency: {
    decimals: 18,
    name: 'Moonbeam',
    symbol: 'GLMR',
  },
  rpcUrls: {
    http: 'https://rpc.api.moonbeam.network',
    ws: 'wss://wss.api.moonbeam.network',
  },
  blockExplorers: {
    name: 'Moonscan',
    url: 'https://moonscan.io',
    apiUrl: 'https://api-moonbeam.moonscan.io/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 609002,
    },
  },
  testnet: false,
})
