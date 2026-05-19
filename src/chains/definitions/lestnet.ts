import * as Chain from '../../core/Chain.js'

export const lestnet = /*#__PURE__*/ Chain.define({
  id: 21363n,
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
