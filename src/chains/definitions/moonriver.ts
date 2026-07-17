import * as Chain from '../../core/Chain.js'

export const moonriver = /*#__PURE__*/ Chain.from({
  id: 1285,
  name: 'Moonriver',
  nativeCurrency: {
    decimals: 18,
    name: 'Moonriver',
    symbol: 'MOVR',
  },
  rpcUrls: {
    http: 'https://rpc.api.moonriver.moonbeam.network',
    ws: 'wss://wss.api.moonriver.moonbeam.network',
  },
  blockExplorers: {
    name: 'Moonscan',
    url: 'https://moonriver.moonscan.io',
    apiUrl: 'https://api-moonriver.moonscan.io/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1597904,
    },
  },
  testnet: false,
})
