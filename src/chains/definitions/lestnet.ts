import * as Chain from '../../core/Chain.js'

export const lestnet = /*#__PURE__*/ Chain.from({
  id: 21363,
  name: 'Lestnet',
  nativeCurrency: { name: 'Lestnet Ether', symbol: 'LETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://service.lestnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lestnet Explorer',
      url: 'https://explore.lestnet.org',
    },
  },
  testnet: true,
})
