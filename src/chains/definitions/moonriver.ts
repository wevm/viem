import * as Chain from '../../core/Chain.js'

export const moonriver = /*#__PURE__*/ Chain.define({
  id: 1285n,
  name: 'Moonriver',
  nativeCurrency: {
    decimals: 18,
    name: 'Moonriver',
    symbol: 'MOVR',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.api.moonriver.moonbeam.network'],
      webSocket: ['wss://wss.api.moonriver.moonbeam.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Moonscan',
      url: 'https://moonriver.moonscan.io',
      apiUrl: 'https://api-moonriver.moonscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1597904,
    },
  },
  testnet: false,
})
