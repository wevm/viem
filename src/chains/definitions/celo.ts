import * as Chain from '../../core/Chain.js'

export const celo = /*#__PURE__*/ Chain.from({
  id: 42_220,
  name: 'Celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: { http: 'https://forno.celo.org' },
  blockExplorers: {
    name: 'Celo Explorer',
    url: 'https://celoscan.io',
    apiUrl: 'https://api.celoscan.io/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13112599,
    },
  },
  testnet: false,
})
